// Server-only connector access reused by the Telegram/ERP approved send path.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
const GATEWAY = 'https://connector-gateway.lovable.dev/whatsapp';
function headers() {
  const lovable = Deno.env.get('LOVABLE_API_KEY'), connection = Deno.env.get('WHATSAPP_API_KEY');
  if (!lovable || !connection) throw new Error('WhatsApp Bruno UK non collegato');
  return { Authorization: `Bearer ${lovable}`, 'X-Connection-Api-Key': connection, 'Content-Type': 'application/json' };
}
export async function ukTemplates() {
  const out: { name: string; language: string; body: string; variables: number; category: string }[] = [];
  let after: string | undefined;
  for (let page = 0; page < 10; page++) {
    const url = new URL(`${GATEWAY}/message_templates`);
    url.searchParams.set('fields', 'name,status,language,category,components'); url.searchParams.set('limit', '100');
    if (after) url.searchParams.set('after', after);
    const res = await fetch(url, { headers: headers(), signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    if (!res.ok) throw new Error(`WhatsApp UK [${res.status}]: ${text}`);
    const data = JSON.parse(text);
    for (const t of data.data ?? []) {
      if (t.status !== 'APPROVED') continue;
      const header = t.components?.find((c: any) => c.type === 'HEADER');
      if (header && (header.format !== 'TEXT' || /\{\{\d+\}\}/.test(header.text ?? ''))) continue;
      const buttons = t.components?.find((c: any) => c.type === 'BUTTONS')?.buttons ?? [];
      if (buttons.some((b: any) => /\{\{\d+\}\}/.test(b.url ?? ''))) continue;
      const body = t.components?.find((c: any) => c.type === 'BODY')?.text ?? '';
      out.push({ name: t.name, language: t.language, body, category: t.category, variables: new Set([...body.matchAll(/\{\{(\d+)\}\}/g)].map((m: any) => m[1])).size });
    }
    after = data.paging?.next ? data.paging?.cursors?.after : undefined;
    if (!after) break;
  }
  return out;
}
export function renderTemplate(body: string, params: string[]) {
  return body.replace(/\{\{(\d+)\}\}/g, (_, n) => params[Number(n) - 1] ?? '');
}
export function inCustomerWindow(createdAt: string | null | undefined, now = Date.now()) {
  const stamp = createdAt ? Date.parse(createdAt) : NaN;
  return Number.isFinite(stamp) && stamp <= now && now - stamp < 24 * 3600000;
}
export async function sendUkApproved(admin: SupabaseClient, input: { lead_id: string; body: string; ai_generated?: boolean; idempotency_key?: string; template?: { name: string; language: string; params: string[] } }, phone: string, userId: string) {
  headers(); // Fail before reserving any work if the linked credentials are missing.
  if (!input.idempotency_key) throw new Error('Identificativo invio mancante');
  if (!/^\d{7,15}$/.test(phone)) throw new Error('Telefono cliente non valido');
  const existing = await admin.from('crm_messages').select('*').eq('id', input.idempotency_key).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) {
    if (existing.data.lead_id !== input.lead_id || existing.data.metadata?.whatsapp_line !== 'uk' || existing.data.body !== input.body) throw new Error('Identificativo invio già usato per un altro messaggio');
    return { message: existing.data }; // queued/uncertain means review, never a retry.
  }
  if (input.template) {
    const tpl = (await ukTemplates()).find(t => t.name === input.template?.name && t.language === input.template?.language);
    if (!tpl || tpl.variables !== input.template.params.length) throw new Error('Template UK non approvato o variabili non valide');
    if (renderTemplate(tpl.body, input.template.params).trim() !== input.body.trim()) throw new Error('Il testo approvato deve corrispondere al template UK compilato');
  } else {
    const inbound = await admin.from('crm_messages').select('created_at').eq('lead_id', input.lead_id).eq('channel', 'whatsapp_api').eq('direction', 'inbound').eq('metadata->>whatsapp_line', 'uk').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (inbound.error) throw inbound.error;
    if (!inCustomerWindow(inbound.data?.created_at)) throw new Error('Bruno UK: fuori dalla finestra 24 ore serve un template approvato');
  }
  const claim = await admin.from('crm_messages').insert({ id: input.idempotency_key, lead_id: input.lead_id, channel: 'whatsapp_api', direction: 'outbound', sender: 'bruno', body: input.body, status: 'queued', ai_generated: input.ai_generated ?? false, created_by: userId,
    metadata: { whatsapp_line: 'uk', submission_status: 'sending', ...(input.template ? { template: input.template.name } : {}) } }).select().single();
  if (claim.error?.code === '23505') return { error: 'Invio già registrato: controlla lo storico, non ripetere' };
  if (claim.error) throw claim.error;
  let externalId: string | null = null, error: string | null = null, submission = 'unknown';
  try {
    const payload = input.template ? { type: 'template', template: { name: input.template.name, language: { code: input.template.language }, ...(input.template.params.length ? { components: [{ type: 'body', parameters: input.template.params.map(text => ({ type: 'text', text })) }] } : {}) } } : { type: 'text', text: { body: input.body } };
    const res = await fetch(`${GATEWAY}/messages`, { method: 'POST', headers: headers(), body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, ...payload }), signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    if (!res.ok) { console.error(`WhatsApp UK [${res.status}]: ${text}`); error = `WhatsApp UK [${res.status}]: ${text}`; submission = res.status >= 500 ? 'unknown' : 'failed'; }
    else { externalId = JSON.parse(text).messages?.[0]?.id ?? null; submission = externalId ? 'accepted' : 'unknown'; }
  } catch (e) { error = e instanceof Error ? e.message : 'Esito invio incerto'; }
  const saved = await admin.from('crm_messages').update({ external_id: externalId, status: submission === 'failed' ? 'failed' : 'queued', error,
    metadata: { ...claim.data.metadata, submission_status: submission, ...(externalId ? { accepted_at: new Date().toISOString() } : {}) } }).eq('id', claim.data.id).select().single();
  if (saved.error) throw saved.error;
  if (externalId) {
    const reconciled = await admin.rpc('reconcile_bruno_uk_status', { p_external_id: externalId });
    if (reconciled.error) throw reconciled.error;
  }
  const result = await admin.from('crm_messages').select('*').eq('id', claim.data.id).single();
  if (result.error) throw result.error;
  return { message: result.data };
}