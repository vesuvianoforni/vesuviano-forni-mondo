import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const EXPECTED_SHA = "e74e8812a356ba913d75cee9a02020358bfad57d8ee7016a183cd64b179ab497";
const stages: Record<string, string> = { new: "nuovo", pre_qualified: "pre_qualificato", qualified: "qualificato", negotiation: "trattativa", won: "vinto", lost: "perso" };
const clean = (v?: string) => (v ?? "").trim() || null;
const phoneKey = (v?: string) => (v ?? "").replace(/\D/g, "").slice(-9);

async function sha(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const { p_payload } = await req.json();
    if (typeof p_payload !== "string" || await sha(p_payload) !== EXPECTED_SHA) return new Response("Forbidden", { status: 403 });
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: done } = await db.from("crm_csv_import_staging").select("id").eq("id", EXPECTED_SHA).maybeSingle();
    if (done) return Response.json({ already_imported: true });

    const rows = JSON.parse(p_payload) as Record<string, string>[];
    const existing: any[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await db.from("leads").select("id,email,phone,notes").range(from, from + 999);
      if (error) throw error;
      existing.push(...data);
      if (data.length < 1000) break;
    }
    const byEmail = new Map(existing.filter((l) => l.email).map((l) => [l.email.toLowerCase(), l]));
    const byPhone = new Map(existing.filter((l) => phoneKey(l.phone).length >= 7).map((l) => [phoneKey(l.phone), l]));
    let inserted = 0, updated = 0;

    for (const r of rows) {
      const status = stages[r.status];
      if (!status) throw new Error(`Fase sconosciuta: ${r.status}`);
      const email = clean(r.email)?.toLowerCase() ?? null;
      const pk = phoneKey(r.phone);
      const match = (email && byEmail.get(email)) || (pk.length >= 7 && byPhone.get(pk)) || null;
      const fields = {
        contact_name: clean(r.contact_name), company_name: clean(r.company_name), email, phone: clean(r.phone),
        country: clean(r.country), city: clean(r.city), priority: clean(r.priority), source: clean(r.source),
        archived: r.archived === "True", status, pipeline: "Vesuviano",
      };
      if (match) {
        const notes = [match.notes, clean(r.notes)].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join("\n\n---\n\n") || null;
        const patch = Object.fromEntries(Object.entries({ ...fields, notes }).filter(([, v]) => v !== null));
        const { error } = await db.from("leads").update(patch).eq("id", match.id);
        if (error) throw error;
        match.notes = notes;
        updated++;
      } else {
        const { data, error } = await db.from("leads").insert({ ...fields, notes: clean(r.notes), created_at: clean(r.created_at) ?? undefined }).select("id,email,phone,notes").single();
        if (error) throw error;
        if (data.email) byEmail.set(data.email.toLowerCase(), data);
        if (pk.length >= 7) byPhone.set(pk, data);
        inserted++;
      }
    }
    await db.from("crm_csv_import_staging").insert({ id: EXPECTED_SHA, payload: { rows: rows.length, inserted, updated } });
    return Response.json({ rows: rows.length, inserted, updated });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e instanceof Error ? e.message : "Import failed" }, { status: 500 });
  }
});