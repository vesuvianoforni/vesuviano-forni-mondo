import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

// Only calls to/from the Vesuviano line (+39 081 1923 1684) are synced.
const VESUVIANO_LINE = '08119231684';
const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '');
const local = (v: unknown) => {
  let d = digits(v);
  if (d.startsWith('0039')) d = d.slice(4);
  else if (d.startsWith('39') && d.length > 10) d = d.slice(2);
  return d;
};
const isVesuviano = (n: unknown) => local(n) === VESUVIANO_LINE;

type Call = Record<string, any>;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const expected = Deno.env.get('ZAPPER_SYNC_KEY');
  if (!expected || req.headers.get('x-api-key') !== expected) return json({ error: 'Unauthorized' }, 401);

  let payload: any;
  try { payload = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const calls: Call[] = Array.isArray(payload) ? payload : Array.isArray(payload?.calls) ? payload.calls : [payload];
  if (calls.length > 500) return json({ error: 'Max 500 calls per request' }, 400);

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const results: any[] = [];

  for (const c of calls) {
    const id = String(c?.unique_call_id ?? c?.id ?? '').trim();
    if (!id || id.length > 200) { results.push({ id, status: 'invalid' }); continue; }
    // Outbound calls from sales extensions (short internal numbers) carry the extension, not the line:
    // accept them only when the called number belongs to an existing Vesuviano lead.
    const ext = digits(c.caller_number);
    const dir = String(c.direction ?? c.call_direction ?? '').toLowerCase();
    const fromExtension = !isVesuviano(c.called_number) && ext.length > 0 && ext.length <= 6;
    const outboundExt = fromExtension || (dir.startsWith('out') && !isVesuviano(c.called_number) && !isVesuviano(c.caller_number) && ext.length <= 6);
    if (!isVesuviano(c.called_number) && !isVesuviano(c.caller_number) && !outboundExt) { results.push({ id, status: 'skipped_other_line' }); continue; }

    const inbound = isVesuviano(c.called_number);
    const customer = inbound ? c.caller_number : c.called_number;
    const key = local(customer).slice(-9);
    if (key.length < 6) { results.push({ id, status: 'no_customer_number' }); continue; }

    // Match lead by last 9 digits of phone
    const { data: matches } = await supabase.from('leads').select('id, phone').ilike('phone', `%${key.slice(-6)}%`).limit(50);
    let lead = (matches ?? []).find((l) => local(l.phone).slice(-9) === key);
    let created = false;
    if (!lead && outboundExt) { results.push({ id, status: 'skipped_no_vesuviano_lead' }); continue; }
    if (!lead) {
      const { data: nl, error } = await supabase.from('leads').insert({
        contact_name: `Chiamata ${String(customer)}`, phone: String(customer), status: 'pre_qualificato',
        pipeline: 'Vesuviano', source: 'Telefonata',
      }).select('id, phone').single();
      if (error) { results.push({ id, status: 'error', error: error.message }); continue; }
      lead = nl; created = true;
    }

    const dur = Number(c.duration_seconds) || 0;
    const mins = `${Math.floor(dur / 60)}m ${Math.round(dur % 60)}s`;
    const when = c.call_date ? new Date(`${c.call_date}T${c.call_time ?? '00:00:00'}`) : new Date();
    const parts = [
      c.ai_summary && c.ai_summary !== '[no_content]' ? `Riassunto: ${c.ai_summary}` : null,
      c.ai_sentiment ? `Sentiment: ${c.ai_sentiment}` : null,
      c.transcription ? `Trascrizione:\n${c.transcription}` : null,
    ].filter(Boolean);
    const row = {
      lead_id: lead!.id, channel: 'call', direction: inbound ? 'inbound' : 'outbound',
      sender: c.operator_name || (inbound ? 'customer' : 'operator'),
      subject: `${inbound ? 'Chiamata ricevuta' : 'Chiamata effettuata'} · ${dur > 0 ? mins : 'senza risposta'}`,
      body: parts.length ? parts.join('\n\n') : (dur > 0 ? 'Trascrizione non ancora disponibile.' : 'Chiamata senza risposta.'),
      status: 'logged', external_id: id,
      created_at: isNaN(when.getTime()) ? new Date().toISOString() : when.toISOString(),
      metadata: {
        source: 'zapper', duration_seconds: dur, recording_url: c.recording_url ?? null,
        caller_number: c.caller_number ?? null, called_number: c.called_number ?? null,
        operator_name: c.operator_name ?? null,
        extension: outboundExt ? (c.caller_number ?? null) : null, ai_actions: c.ai_actions ?? null,
      },
    };

    const { data: existing } = await supabase.from('crm_messages').select('id').eq('channel', 'call').eq('external_id', id).maybeSingle();
    const { error } = existing
      ? await supabase.from('crm_messages').update(row).eq('id', existing.id)
      : await supabase.from('crm_messages').insert(row);
    results.push(error ? { id, status: 'error', error: error.message } : { id, status: existing ? 'updated' : 'inserted', lead_id: lead!.id, lead_created: created });
  }

  const summary = results.reduce((a: Record<string, number>, r) => ((a[r.status] = (a[r.status] ?? 0) + 1), a), {});
  return json({ ok: true, summary, results });
});
