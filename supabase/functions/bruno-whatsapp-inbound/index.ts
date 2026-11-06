import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { COUNTRY_LINES } from '../bruno-agent/meta-whatsapp.ts';

// Receives Meta WhatsApp webhook `value` objects for Bruno's country lines, forwarded by Zapper
// (Zapper owns the Meta app webhook). Auth: x-api-key = ZAPPER_SYNC_KEY. Messages land in crm_messages
// (channel whatsapp_api, metadata.whatsapp_line) deduplicated by wamid; statuses update outbound rows.
const headers = { ...corsHeaders, 'Access-Control-Allow-Headers': `${corsHeaders['Access-Control-Allow-Headers']}, x-api-key` };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
const digits = (s: unknown) => String(s ?? '').replace(/\D/g, '');

function bodyOf(m: any): { text: string; type: string; caption?: string; file_name?: string } {
  const type = String(m.type ?? 'text');
  if (type === 'text') return { text: String(m.text?.body ?? ''), type };
  if (type === 'button') return { text: String(m.button?.text ?? ''), type };
  if (type === 'interactive') return { text: String(m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? ''), type };
  if (type === 'reaction') return { text: `Reazione ${m.reaction?.emoji ?? ''}`.trim(), type };
  if (type === 'location') return { text: `Posizione: ${m.location?.name ?? ''} ${m.location?.latitude ?? ''},${m.location?.longitude ?? ''}`.trim(), type };
  const media = m[type] ?? {};
  const label: Record<string, string> = { image: 'Foto', video: 'Video', audio: 'Vocale', document: 'Documento', sticker: 'Sticker' };
  return { text: media.caption ? String(media.caption) : `[${label[type] ?? type}]`, type, file_name: media.filename };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const expected = Deno.env.get('ZAPPER_SYNC_KEY');
  if (!expected || req.headers.get('x-api-key') !== expected) return json({ error: 'Unauthorized' }, 401);

  let payload: any;
  try { payload = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const values: any[] = Array.isArray(payload?.values) ? payload.values : payload?.value ? [payload.value] : [];
  if (!values.length || values.length > 50) return json({ error: 'Expected 1-50 values' }, 400);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const results: any[] = [];

  for (const value of values) {
    const line = COUNTRY_LINES.find((l) => l.phoneId === String(value?.metadata?.phone_number_id ?? ''));
    if (!line) { results.push({ status: 'skipped_unknown_line' }); continue; }
    const names = new Map<string, string>((value.contacts ?? []).map((c: any) => [digits(c.wa_id), String(c.profile?.name ?? '')]));

    for (const m of (value.messages ?? []).slice(0, 100)) {
      const wamid = String(m?.id ?? '');
      const from = digits(m?.from);
      if (!wamid || from.length < 7) { results.push({ status: 'invalid' }); continue; }
      const { data: dup } = await admin.from('crm_messages').select('id').eq('channel', 'whatsapp_api').eq('external_id', wamid).maybeSingle();
      if (dup) { results.push({ id: wamid, status: 'duplicate' }); continue; }

      const { data: cands } = await admin.from('leads').select('id, phone, updated_at').ilike('phone', `%${from.slice(-7)}%`).order('updated_at', { ascending: false }).limit(20);
      let lead = (cands ?? []).find((l: any) => { const p = digits(l.phone); return p.endsWith(from.slice(-9)) || from.endsWith(p.slice(-9)); }) as { id: string } | undefined;
      const name = names.get(from) || '';
      if (!lead) {
        const { data, error } = await admin.from('leads').insert({
          contact_name: name || `${line.label} +${from}`, phone: `+${from}`, source: `whatsapp_${line.key}`,
          notes: `Lead creato da un messaggio in arrivo su ${line.label}.`,
        }).select('id').single();
        if (error) { results.push({ id: wamid, status: 'error', error: error.message }); continue; }
        lead = data;
      }

      const b = bodyOf(m);
      const ts = Number(m.timestamp) * 1000;
      const { error } = await admin.from('crm_messages').insert({
        lead_id: lead!.id, channel: 'whatsapp_api', direction: 'inbound', sender: 'customer',
        body: b.text || '[Messaggio]', status: 'delivered', external_id: wamid,
        created_at: Number.isFinite(ts) && ts > 0 ? new Date(ts).toISOString() : new Date().toISOString(),
        metadata: { source: 'meta_forwarded', whatsapp_line: line.key, message_type: b.type, customer_name: name || null, file_name: b.file_name ?? null, ...(b.type !== 'text' && m[b.type]?.id ? { meta_media_id: m[b.type].id } : {}) },
      });
      // Unique violations mean a concurrent delivery already stored it.
      results.push(error ? { id: wamid, status: error.code === '23505' ? 'duplicate' : 'error', error: error.message } : { id: wamid, status: 'inserted', lead_id: lead!.id });
    }

    for (const s of (value.statuses ?? []).slice(0, 100)) {
      const wamid = String(s?.id ?? '');
      const map: Record<string, string> = { sent: 'sent', delivered: 'delivered', read: 'read', failed: 'failed' };
      const st = map[String(s?.status ?? '')];
      if (!wamid || !st) continue;
      const err = st === 'failed' ? String(s.errors?.[0]?.title ?? s.errors?.[0]?.message ?? 'Consegna non riuscita') : null;
      await admin.from('crm_messages').update({ status: st, ...(err ? { error: err } : {}) }).eq('channel', 'whatsapp_api').eq('external_id', wamid).eq('direction', 'outbound');
      results.push({ id: wamid, status: `status_${st}` });
    }
  }

  const summary = results.reduce((a: Record<string, number>, r) => ((a[r.status] = (a[r.status] ?? 0) + 1), a), {});
  return json({ ok: true, summary });
});
