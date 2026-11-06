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
    ai_generated: z.boolean().optional(),
    template: z.object({ name: z.string(), language: z.string(), params: z.array(z.string().max(500)).max(10) }).optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const { admin, userId } = await staff(data.token);
    const { data: lead } = await admin.from("leads").select("id, phone").eq("id", data.lead_id).maybeSingle();
    if (!lead) throw new Error("Lead non trovato");
    const to = String(lead.phone ?? "").replace(/\D/g, "").replace(/^00/, "");
    let status = "sent", error: string | null = null, externalId: string | null = null;
    if (!to) { status = "failed"; error = "Telefono mancante"; }
    else {
      const payload = data.template
        ? { type: "template", template: { name: data.template.name, language: { code: data.template.language },
            ...(data.template.params.length ? { components: [{ type: "body", parameters: data.template.params.map((p) => ({ type: "text", text: p })) }] } : {}) } }
        : { type: "text", text: { body: data.body } };
      try {
        const r = await fetch(`${GATEWAY}/messages`, { method: "POST", headers: headers(), body: JSON.stringify({ messaging_product: "whatsapp", to, ...payload }) });
        const t = await r.text();
        if (!r.ok) { status = "failed"; error = `WhatsApp UK ${r.status}: ${t.slice(0, 300)}`; }
        else { try { externalId = JSON.parse(t).messages?.[0]?.id ?? null; } catch { /* id unknown */ } }
      } catch (e) { status = "failed"; error = (e as Error).message; }
    }
    const { error: dbErr } = await admin.from("crm_messages").insert({
      lead_id: lead.id, channel: "whatsapp_api", direction: "outbound", sender: "bruno", body: data.body,
      status, error, external_id: externalId, ai_generated: data.ai_generated ?? false, created_by: userId,
      metadata: { whatsapp_line: "uk", ...(data.template ? { template: data.template.name } : {}) },
    } as never);
    if (dbErr) throw new Error(dbErr.message);
    if (status === "failed") throw new Error(error ?? "Invio non riuscito");
    return { ok: true };
  });
