import type { SupabaseClient } from '@supabase/supabase-js';
import { telnyxDialer } from './crmDialer.server';
import type { DialerCredentials } from './crmDialer';
import { historicalInboundCalls, TelnyxHistoryRecord, type TelnyxHistoryRow } from './inboundCallHistory';

export async function syncInboundHistory(db: SupabaseClient, credentials: DialerCredentials) {
  const records: TelnyxHistoryRow[] = [];
  let complete = false;
  for (let page = 1; page <= 40; page++) {
    const query = new URLSearchParams({ 'filter[record_type]':'sip-trunking', 'page[size]':'50', 'page[number]':String(page) });
    const result = await telnyxDialer(`/detail_records?${query}`, credentials);
    if (!Array.isArray(result.data) || !result.meta || !Number.isInteger(result.meta.total_pages)) throw new Error('Storico Telnyx non leggibile.');
    for (const row of result.data) { const parsed = TelnyxHistoryRecord.safeParse(row); if (parsed.success) records.push(parsed.data); }
    if (page >= result.meta.total_pages) { complete = true; break; }
  }
  if (!complete) throw new Error('Lo storico Telnyx supera il limite di recupero; nessun aggiornamento parziale effettuato.');
  const known: string[] = [];
  for (let offset = 0; ; offset += 500) {
    const result = await db.from('bruno_voice_calls').select('provider_call_id').eq('direction','inbound').order('id').range(offset,offset+499);
    if (result.error) throw new Error('Impossibile confrontare lo storico Bruno.');
    for (const call of result.data ?? []) if (call.provider_call_id) known.push(call.provider_call_id);
    if ((result.data?.length ?? 0) < 500) break;
  }
  const candidates = historicalInboundCalls(records, known);
  let imported = 0;
  for (let offset = 0; offset < candidates.length; offset += 100) {
    const result = await db.from('crm_inbound_calls').upsert(candidates.slice(offset,offset+100), {onConflict:'provider_call_id',ignoreDuplicates:true}).select('id');
    if (result.error) throw new Error('Recupero dello storico interrotto. Puoi riprovare senza duplicare le chiamate.');
    imported += result.data?.length ?? 0;
  }
  return { imported, checked: candidates.length };
}