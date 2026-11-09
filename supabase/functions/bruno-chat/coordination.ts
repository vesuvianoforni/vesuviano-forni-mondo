import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export const COMMUNICATION_CHANNELS = ['email', 'wasender', 'whatsapp_api', 'whatsapp_uk', 'call', 'note'] as const;
export function communicationChannel(m: { channel: string; metadata?: Record<string, unknown> | null }) {
  return m.channel === 'whatsapp_api' && m.metadata?.whatsapp_line === 'uk' ? 'whatsapp_uk' : m.channel;
}
export function customerLinks(id: string) {
  const lead = encodeURIComponent(id);
  return { crm: `/erp/crm?lead=${lead}`, dial: `/erp/dial?lead=${lead}`, chat: `/erp/chat?lead=${lead}`, mail: `/erp/mail?lead=${lead}` };
}
export function directCallEvidence(c: Record<string, any>) {
  return { id: c.id, lead_id: c.lead_id, mode: 'direct', operator_id: c.operator_id,
    destination: c.destination, from_number: c.from_number, status: c.status,
    created_at: c.created_at, answered_at: c.answered_at, ended_at: c.ended_at,
    duration_seconds: c.answered_at && c.ended_at ? Math.max(0, Math.floor((Date.parse(c.ended_at) - Date.parse(c.answered_at)) / 1000)) : null,
    evidence_source: 'browser_reported', transcript_available: false,
    content_note: 'Chiamata del team: esito dal browser. Contenuto non disponibile senza note dell’operatore; non inventare dialogo o qualificazione.' };
}
export async function communicationPage(reader: SupabaseClient, a: Record<string, any>) {
  const channel = a.channel ?? 'all';
  if (channel !== 'all' && !COMMUNICATION_CHANNELS.some(c => c === channel)) throw new Error('Canale non valido');
  let q = reader.from('crm_messages').select('id,lead_id,channel,direction,sender,status,subject,body,metadata,created_at')
    .eq('lead_id', a.lead_id).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(21);
  if (channel === 'whatsapp_uk') q = q.eq('channel', 'whatsapp_api').eq('metadata->>whatsapp_line', 'uk');
  else if (channel === 'whatsapp_api') q = q.eq('channel', channel).or('metadata->>whatsapp_line.is.null,metadata->>whatsapp_line.neq.uk');
  else if (channel !== 'all') q = q.eq('channel', channel);
  if (a.before_at && a.before_id) q = q.or(`created_at.lt.${a.before_at},and(created_at.eq.${a.before_at},id.lt.${a.before_id})`);
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []).slice(0, 20);
  const last = rows.at(-1);
  return { messages: rows.map(m => ({ ...m, channel: communicationChannel(m), body: String(m.body ?? '').slice(0, 900),
    metadata: { whatsapp_line: m.metadata?.whatsapp_line, call_mode: m.metadata?.call_mode, source: m.metadata?.source,
      media_url: m.metadata?.media_url, message_type: m.metadata?.message_type } })),
    has_more: (data ?? []).length > 20, next_cursor: (data ?? []).length > 20 && last ? { before_at: last.created_at, before_id: last.id } : null,
    links: customerLinks(a.lead_id) };
}
export async function callHistory(reader: SupabaseClient, a: Record<string, any>) {
  let direct = reader.from('crm_direct_calls').select('id,lead_id,operator_id,destination,from_number,status,created_at,answered_at,ended_at').order('created_at', { ascending: false }).order('id', { ascending: false }).limit(16);
  let ai = reader.from('bruno_voice_calls').select('id,lead_id,destination,from_number,status,direction,created_at,ended_at,summary,transcript_status,duration_seconds,call_type').order('created_at', { ascending: false }).order('id', { ascending: false }).limit(16);
  if (a.lead_id) { direct = direct.eq('lead_id', a.lead_id); ai = ai.eq('lead_id', a.lead_id); }
  if (a.before_at && a.before_id) {
    const cursor = `created_at.lt.${a.before_at},and(created_at.eq.${a.before_at},id.lt.${a.before_id})`;
    direct = direct.or(cursor); ai = ai.or(cursor);
  }
  const [d, v] = await Promise.all([direct, ai]);
  if (d.error) throw d.error;
  if (v.error) throw v.error;
  const all = [...(d.data ?? []).map(directCallEvidence), ...(v.data ?? []).map(c => ({ ...c, mode: 'bruno_ai', summary: String(c.summary ?? '').slice(0, 1200) }))]
    .sort((x, y) => String(y.created_at).localeCompare(String(x.created_at)) || String(y.id).localeCompare(String(x.id)));
  const rows = all.slice(0, 15), last = rows.at(-1);
  return { calls: rows, has_more: all.length > 15, next_cursor: all.length > 15 && last ? { before_at: last.created_at, before_id: last.id } : null,
    ...(a.lead_id ? { links: customerLinks(a.lead_id) } : {}) };
}
export async function assertNoHumanCall(reader: SupabaseClient, ids: string[]) {
  if (!ids.length) return;
  const { data, error } = await reader.from('crm_direct_calls').select('id,lead_id,status').in('lead_id', ids).in('status', ['preparing', 'dialing', 'active', 'unknown']).limit(1);
  if (error) throw error;
  if (data?.length) throw new Error('Il team ha una chiamata aperta o da verificare con questo cliente. Non sovrapporre una chiamata Bruno.');
}