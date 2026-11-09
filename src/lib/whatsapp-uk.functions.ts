import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Bruno UK line (+44 7457 416033) through the Lovable WhatsApp connector.
// Sending and template reads run server-side only; the caller's session token is verified first.
const GATEWAY = "https://connector-gateway.lovable.dev/whatsapp";

function headers() {
  const lovable = process.env["LOVABLE_API_KEY"];
  const wa = process.env["WHATSAPP_API_KEY"];
  if (!lovable || !wa) throw new Error("WhatsApp Bruno UK non collegato");
  return { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": wa, "Content-Type": "application/json" };
}

async function staff(token: string) {
  const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
  const { data: u } = await admin.auth.getUser(token);
  if (!u?.user) throw new Error("Non autenticato");
  const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", u.user.id);
  if (!roles?.some((r) => r.role === "admin" || r.role === "commerciale")) throw new Error("Accesso negato");
  return { admin, userId: u.user.id };
}

const countVars = (s: string) => new Set([...s.matchAll(/\{\{(\d+)\}\}/g)].map((m) => m[1])).size;

export const listUkTemplates = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(10) }).parse(d))
  .handler(async ({ data }) => {
    await staff(data.token);
    const out: { name: string; language: string; category: string; body: string; variables: number; status: string }[] = [];
    let after: string | null = null;
    for (let page = 0; page < 10; page++) {
      const url = new URL(`${GATEWAY}/message_templates`);
      url.searchParams.set("fields", "name,status,language,category,components");
      url.searchParams.set("limit", "100");
      if (after) url.searchParams.set("after", after);
      const r = await fetch(url, { headers: headers() });
      const t = await r.text();
      if (!r.ok) throw new Error(`WhatsApp UK ${r.status}: ${t.slice(0, 300)}`);
      const d = JSON.parse(t);
      for (const tpl of d.data ?? []) {
        const comps = tpl.components ?? [];
        const header = comps.find((c: any) => c.type === "HEADER");
        if (header && (header.format !== "TEXT" || countVars(header.text ?? "") > 0)) continue;
        const buttons = comps.find((c: any) => c.type === "BUTTONS")?.buttons ?? [];
        if (buttons.some((b: any) => /\{\{\d+\}\}/.test(b.url ?? ""))) continue;
        const body = comps.find((c: any) => c.type === "BODY")?.text ?? "";
        out.push({ name: tpl.name, language: tpl.language, category: tpl.category, body, variables: countVars(body), status: tpl.status });
      }
      after = d.paging?.next ? d.paging?.cursors?.after ?? null : null;
      if (!after) break;
    }
    return out.sort((a, b) => a.name.localeCompare(b.name) || a.language.localeCompare(b.language));
  });

export const createUkTemplate = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    token: z.string().min(10),
    name: z.string().regex(/^[a-z0-9_]{1,512}$/),
    language: z.string().min(2).max(10),
    category: z.enum(["UTILITY", "MARKETING"]),
    body: z.string().min(10).max(1024),
    examples: z.array(z.string().min(1).max(200)).max(10),
  }).parse(d))
  .handler(async ({ data }) => {
    await staff(data.token);
    const vars = countVars(data.body);
    if (vars !== data.examples.length) throw new Error("Serve un esempio per ogni variabile");
    const r = await fetch(`${GATEWAY}/message_templates`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ name: data.name, language: data.language, category: data.category,
        components: [{ type: "BODY", text: data.body, ...(vars ? { example: { body_text: [data.examples] } } : {}) }] }),
    });
    const t = await r.text();
    if (!r.ok) throw new Error(`WhatsApp UK ${r.status}: ${t.slice(0, 400)}`);
    return { ok: true };
  });

export const sendUkWhatsApp = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    token: z.string().min(10),
    lead_id: z.string().uuid(),
    body: z.string().min(1).max(4096),
    idempotency_key: z.string().uuid(),
    ai_generated: z.boolean().optional(),
    template: z.object({ name: z.string(), language: z.string(), params: z.array(z.string().max(500)).max(10) }).optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    // UI and approved Telegram actions share the same durable sender and status reconciliation.
    // The receiving function verifies the user's token and sales role, never a service-key caller.
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) throw new Error('Servizio WhatsApp UK non configurato');
    const { token, ...input } = data;
    const response = await fetch(`${url}/functions/v1/bruno-agent`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, action: 'send', channel: 'whatsapp_api', whatsapp_line: 'uk' }), signal: AbortSignal.timeout(25000),
    });
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.error ?? `WhatsApp UK [${response.status}]`);
    if (result.message?.status === 'failed') throw new Error(result.message.error ?? 'Invio non riuscito');
    return { status: String(result.message?.status ?? 'queued'), submission: String(result.message?.metadata?.submission_status ?? 'unknown') };
  });
