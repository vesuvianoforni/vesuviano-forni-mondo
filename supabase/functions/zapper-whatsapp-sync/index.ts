import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { externalId, isGennaro, local, messageBody, normalizeText, phoneKey } from './scope.ts';

// Receives Gennaro's WaSender WhatsApp messages already stored by Zapper (live + history)
// and projects them into crm_messages (channel 'wasender'). Auth: x-api-key = ZAPPER_SYNC_KEY.
const headers = { ...corsHeaders, 'Access-Control-Allow-Headers': `${corsHeaders['Access-Control-Allow-Headers']}, x-api-key` };
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

type Msg = Record<string, any>;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const expected = Deno.env.get('ZAPPER_SYNC_KEY');
  if (!expected || req.headers.get('x-api-key') !== expected) return json({ error: 'Unauthorized' }, 401);

  let payload: any;
  try { payload = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const messages: Msg[] = Array.isArray(payload) ? payload : Array.isArray(payload?.messages) ? payload.messages : [payload];
  if (messages.length > 500) return json({ error: 'Max 500 messages per request' }, 400);

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const leadCache = new Map<string, { id: string } | null>();
  const results: any[] = [];

  for (const m of messages) {
    const ext = externalId(m);
    if (!ext) { results.push({ id: m?.id ?? null, status: 'invalid' }); continue; }
    if (!isGennaro(m.account_phone)) { results.push({ id: ext, status: 'skipped_other_account' }); continue; }
    const key = phoneKey(m.customer_phone);
    if (key.length < 6 || String(m.customer_phone ?? '').includes('@g.us')) { results.push({ id: ext, status: 'skipped_no_customer' }); continue; }

    // Only chats with existing Vesuviano leads: Gennaro's personal chats are never imported or turned into leads.
    if (!leadCache.has(key)) {
      const { data } = await supabase.from('leads').select('id, phone').ilike('phone', `%${key.slice(-6)}%`).limit(50);
      leadCache.set(key, (data ?? []).find((l) => phoneKey(l.phone) === key) ?? null);
    }
    const lead = leadCache.get(key);
    if (!lead) { results.push({ id: ext, status: 'skipped_no_vesuviano_lead' }); continue; }

    const outbound = String(m.direction ?? '').toLowerCase().startsWith('out');
    const when = new Date(m.created_at ?? Date.now());
    const createdAt = isNaN(when.getTime()) ? new Date().toISOString() : when.toISOString();
    const body = messageBody(m);
    const row = {
      lead_id: lead.id, channel: 'wasender', direction: outbound ? 'outbound' : 'inbound',
      sender: outbound ? 'gennaro' : 'customer', body, status: outbound ? 'sent' : 'delivered',
      external_id: ext, created_at: createdAt,
      metadata: {
        source: 'zapper', message_type: m.message_type ?? 'text', media_url: m.media_url ?? null,
        file_name: m.file_name ?? null, customer_phone: local(m.customer_phone), customer_name: m.customer_name ?? null,
        wasender_status: m.status ?? null,
      },
    };

    const { data: existing } = await supabase.from('crm_messages').select('id').eq('channel', 'wasender').eq('external_id', ext).maybeSingle();
    let targetId = existing?.id as string | undefined;

    // Echo of a message sent from Vesuviano (Bruno panel): attach to the existing row instead of duplicating it.
    if (!targetId && outbound) {
      const from = new Date(when.getTime() - 15 * 60e3).toISOString();
      const to = new Date(when.getTime() + 15 * 60e3).toISOString();
      const { data: twins } = await supabase.from('crm_messages').select('id, body, metadata')
        .eq('lead_id', lead.id).eq('channel', 'wasender').eq('direction', 'outbound').gte('created_at', from).lte('created_at', to).limit(20);
      const twin = (twins ?? []).find((t: any) => (t.metadata as any)?.source !== 'zapper' && normalizeText(t.body) === normalizeText(body));
      if (twin) {
        const { error } = await supabase.from('crm_messages').update({ external_id: ext }).eq('id', twin.id);
        results.push(error ? { id: ext, status: 'error', error: error.message } : { id: ext, status: 'linked_echo', lead_id: lead.id });
        continue;
      }
    }

    const { error } = targetId
      ? await supabase.from('crm_messages').update(row).eq('id', targetId)
      : await supabase.from('crm_messages').insert(row);
    if (error) { results.push({ id: ext, status: 'error', error: error.message }); continue; }

    // Gennaro wrote from his phone recently: pause Bruno 48h on that lead (only for new, recent messages).
    if (!targetId && outbound && Date.now() - when.getTime() < 48 * 3600e3) {
      await supabase.from('leads').update({ bruno_paused_until: new Date(when.getTime() + 48 * 3600e3).toISOString() }).eq('id', lead.id);
    }
    results.push({ id: ext, status: targetId ? 'updated' : 'inserted', lead_id: lead.id });
  }

  const summary = results.reduce((a: Record<string, number>, r) => ((a[r.status] = (a[r.status] ?? 0) + 1), a), {});
  return json({ ok: true, summary, results });
});
