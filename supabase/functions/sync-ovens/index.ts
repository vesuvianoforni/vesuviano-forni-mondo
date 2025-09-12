// Supabase Edge Function: sync-ovens
// Inserts missing ovens (by unique name) using the service role to bypass RLS for writes
// Returns summary info; the client will refetch the list after invocation

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { ovens } = await req.json().catch(() => ({ ovens: null }));
    if (!Array.isArray(ovens)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch existing oven names
    const { data: existing, error: selErr } = await supabase
      .from("ovens")
      .select("name");
    if (selErr) throw selErr;

    const existingNames = new Set((existing || []).map((o: any) => o.name));

    // Whitelist fields to avoid accidental extra props
    const sanitize = (o: any) => ({
      name: o.name,
      category: o.category,
      subcategory: o.subcategory ?? null,
      image_url: o.image_url,
      description: o.description ?? null,
      specifications: o.specifications ?? null,
      fuel_type: o.fuel_type ?? null,
      coating_type: o.coating_type ?? null,
    });

    const missing = ovens
      .filter((o: any) => o && o.name && !existingNames.has(o.name))
      .map(sanitize);

    if (missing.length > 0) {
      const { error: insErr } = await supabase.from("ovens").insert(missing);
      if (insErr) throw insErr;
    }

    const { data: all, error: allErr } = await supabase
      .from("ovens")
      .select("*")
      .order("created_at", { ascending: false });
    if (allErr) throw allErr;

    return new Response(
      JSON.stringify({ inserted: missing.length, total: all?.length || 0 }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = (e as any)?.message || "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
