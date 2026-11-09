// Bruno's official WhatsApp line, called directly on Meta Graph API with server-only credentials.
const GRAPH = 'https://graph.facebook.com/v21.0';

export type WaTemplate = { name: string; language: string; category: string; body: string; variables: number };

import { lineFor } from '../_shared/bruno/whatsapp-lines.ts';
export { COUNTRY_LINES, lineFor } from '../_shared/bruno/whatsapp-lines.ts';

function creds(to?: string | null, explicitLine?: 'it' | 'uk') {
  const token = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN');
  const line = explicitLine === 'it' ? null : lineFor(to);
  const phoneId = line?.phoneId ?? Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID');
  const wabaId = line?.wabaId ?? Deno.env.get('META_WHATSAPP_WABA_ID');
  if (!token || !phoneId || !wabaId) throw new Error('WhatsApp API di Bruno non configurato');
  return { token, phoneId, wabaId, line: line?.key ?? 'default' };
}

const countVars = (s: string) => new Set([...s.matchAll(/\{\{(\d+)\}\}/g)].map((m) => m[1])).size;

// Only approved templates Bruno can fill on his own: no media headers, no variable buttons.
export async function listTemplates(to?: string | null): Promise<WaTemplate[]> {
  const { token, wabaId } = creds(to);
  const out: WaTemplate[] = [];
  let next: string | null = `${GRAPH}/${wabaId}/message_templates?fields=name,status,language,category,components&limit=100`;
  while (next) {
    const r = await fetch(next, { headers: { Authorization: `Bearer ${token}` } });
    const t = await r.text();
    if (!r.ok) throw new Error(`Meta ${r.status}: ${t.slice(0, 300)}`);
    const d = JSON.parse(t);
    for (const tpl of d.data ?? []) {
      if (tpl.status !== 'APPROVED') continue;
      const comps = tpl.components ?? [];
      const header = comps.find((c: any) => c.type === 'HEADER');
      if (header && (header.format !== 'TEXT' || countVars(header.text ?? '') > 0)) continue;
      const buttons = comps.find((c: any) => c.type === 'BUTTONS')?.buttons ?? [];
      if (buttons.some((b: any) => /\{\{\d+\}\}/.test(b.url ?? ''))) continue;
      const body = comps.find((c: any) => c.type === 'BODY')?.text ?? '';
      if (out.some((o) => o.name === tpl.name && o.language === tpl.language)) continue;
      out.push({ name: tpl.name, language: tpl.language, category: tpl.category, body, variables: countVars(body) });
    }
    next = d.paging?.next ?? null;
  }
  return out.sort((a, b) => a.name.localeCompare(b.name) || a.language.localeCompare(b.language));
}

export async function sendWhatsApp(
  to: string,
  msg: { text: string } | { template: { name: string; language: string; params: string[] } },
  explicitLine?: 'it' | 'uk',
): Promise<string | null> {
  const { token, phoneId } = creds(to, explicitLine);
  const payload = 'text' in msg
    ? { type: 'text', text: { body: msg.text } }
    : { type: 'template', template: { name: msg.template.name, language: { code: msg.template.language },
        ...(msg.template.params.length ? { components: [{ type: 'body', parameters: msg.template.params.map((p) => ({ type: 'text', text: p })) }] } : {}) } };
  const r = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, ...payload }),
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`WhatsApp ${r.status}: ${t.slice(0, 300)}`);
  try { return JSON.parse(t).messages?.[0]?.id ?? null; } catch { return null; }
}
