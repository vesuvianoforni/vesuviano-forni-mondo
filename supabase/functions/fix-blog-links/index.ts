import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DOMAIN = "https://vesuvianoforni.com";

// Map of known broken patterns → correct full URLs per language
const REPLACEMENTS: Record<string, [RegExp, string][]> = {
  it: [
    [/href="\/it\/forni-pizza-professionali[^"]*"/g, `href="${DOMAIN}/it/forni-tradizionali"`],
    [/href="\/it\/configuratore[^"]*"/g, `href="${DOMAIN}/it"`],
    [/href="\/it\/contatti?[^"]*"/g, `href="${DOMAIN}/it"`],
    [/href="\/it\/forno-a-legna[^"]*"/g, `href="${DOMAIN}/it/forni-tradizionali"`],
    [/href="\/it\/forno-gas[^"]*"/g, `href="${DOMAIN}/it/forni-gas"`],
    [/href="\/it\/forno-elettrico[^"]*"/g, `href="${DOMAIN}/it/forni-elettrici"`],
    [/href="\/it\/forni-rotanti[^"]*"/g, `href="${DOMAIN}/it/forni-rotanti"`],
    [/href="\/it\/vesuviobuono[^"]*"/g, `href="${DOMAIN}/it/sistema-vesuviobuono"`],
    [/href="\/it\/architettoai[^"]*"/g, `href="${DOMAIN}/it/architettoai"`],
    [/href="\/it\/pronta-consegna[^"]*"/g, `href="${DOMAIN}/it/pronta-consegna"`],
    [/href="\/it\/blog[^"]*"/g, `href="${DOMAIN}/it/blog"`],
    [/href="\/it\/?"/g, `href="${DOMAIN}/it"`],
  ],
  en: [
    [/href="\/en\/pizza-ovens?[^"]*"/g, `href="${DOMAIN}/en/traditional-ovens"`],
    [/href="\/en\/wood-fired[^"]*"/g, `href="${DOMAIN}/en/traditional-ovens"`],
    [/href="\/en\/configurator[^"]*"/g, `href="${DOMAIN}/en"`],
    [/href="\/en\/contact[^"]*"/g, `href="${DOMAIN}/en"`],
    [/href="\/en\/gas-ovens?[^"]*"/g, `href="${DOMAIN}/en/gas-ovens"`],
    [/href="\/en\/electric-ovens?[^"]*"/g, `href="${DOMAIN}/en/electric-ovens"`],
    [/href="\/en\/rotating-ovens?[^"]*"/g, `href="${DOMAIN}/en/rotating-ovens"`],
    [/href="\/en\/vesuviobuono[^"]*"/g, `href="${DOMAIN}/en/vesuviobuono-system"`],
    [/href="\/en\/architettoai[^"]*"/g, `href="${DOMAIN}/en/architettoai"`],
    [/href="\/en\/architect[^"]*"/g, `href="${DOMAIN}/en/architettoai"`],
    [/href="\/en\/ready-to-ship[^"]*"/g, `href="${DOMAIN}/en/ready-to-ship"`],
    [/href="\/en\/blog[^"]*"/g, `href="${DOMAIN}/en/blog"`],
    [/href="\/en\/?"/g, `href="${DOMAIN}/en"`],
  ],
  fr: [
    [/href="\/fr\/fours?[^"]*pizza[^"]*"/g, `href="${DOMAIN}/fr/fours-traditionnels"`],
    [/href="\/fr\/fours?-traditionnels?[^"]*"/g, `href="${DOMAIN}/fr/fours-traditionnels"`],
    [/href="\/fr\/configurateur[^"]*"/g, `href="${DOMAIN}/fr"`],
    [/href="\/fr\/contact[^"]*"/g, `href="${DOMAIN}/fr"`],
    [/href="\/fr\/fours?-gaz[^"]*"/g, `href="${DOMAIN}/fr/fours-gaz"`],
    [/href="\/fr\/fours?-electriques?[^"]*"/g, `href="${DOMAIN}/fr/fours-electriques"`],
    [/href="\/fr\/fours?-rotatifs?[^"]*"/g, `href="${DOMAIN}/fr/fours-rotatifs"`],
    [/href="\/fr\/vesuviobuono[^"]*"/g, `href="${DOMAIN}/fr/systeme-vesuviobuono"`],
    [/href="\/fr\/architettoai[^"]*"/g, `href="${DOMAIN}/fr/architettoai"`],
    [/href="\/fr\/architecte[^"]*"/g, `href="${DOMAIN}/fr/architettoai"`],
    [/href="\/fr\/pret-a-expedier[^"]*"/g, `href="${DOMAIN}/fr/pret-a-expedier"`],
    [/href="\/fr\/blog[^"]*"/g, `href="${DOMAIN}/fr/blog"`],
    [/href="\/fr\/?"/g, `href="${DOMAIN}/fr"`],
  ],
  de: [
    [/href="\/de\/pizzaoefen?[^"]*"/g, `href="${DOMAIN}/de/traditionelle-oefen"`],
    [/href="\/de\/traditionelle[^"]*"/g, `href="${DOMAIN}/de/traditionelle-oefen"`],
    [/href="\/de\/pizzaofen-konfigurator[^"]*"/g, `href="${DOMAIN}/de"`],
    [/href="\/de\/konfigurator[^"]*"/g, `href="${DOMAIN}/de"`],
    [/href="\/de\/kontakt[^"]*"/g, `href="${DOMAIN}/de"`],
    [/href="\/de\/gasoefen[^"]*"/g, `href="${DOMAIN}/de/gasoefen"`],
    [/href="\/de\/elektrooefen[^"]*"/g, `href="${DOMAIN}/de/elektrooefen"`],
    [/href="\/de\/drehoefen[^"]*"/g, `href="${DOMAIN}/de/drehoefen"`],
    [/href="\/de\/vesuviobuono[^"]*"/g, `href="${DOMAIN}/de/vesuviobuono-system"`],
    [/href="\/de\/architettoai[^"]*"/g, `href="${DOMAIN}/de/architettoai"`],
    [/href="\/de\/architekt[^"]*"/g, `href="${DOMAIN}/de/architettoai"`],
    [/href="\/de\/versandfertig[^"]*"/g, `href="${DOMAIN}/de/versandfertig"`],
    [/href="\/de\/blog[^"]*"/g, `href="${DOMAIN}/de/blog"`],
    [/href="\/de\/?"/g, `href="${DOMAIN}/de"`],
  ],
  es: [
    [/href="\/es\/hornos?-pizza[^"]*"/g, `href="${DOMAIN}/es/hornos-tradicionales"`],
    [/href="\/es\/hornos?-tradicionales?[^"]*"/g, `href="${DOMAIN}/es/hornos-tradicionales"`],
    [/href="\/es\/configurador[^"]*"/g, `href="${DOMAIN}/es"`],
    [/href="\/es\/contacto[^"]*"/g, `href="${DOMAIN}/es"`],
    [/href="\/es\/hornos?-gas[^"]*"/g, `href="${DOMAIN}/es/hornos-gas"`],
    [/href="\/es\/hornos?-electricos?[^"]*"/g, `href="${DOMAIN}/es/hornos-electricos"`],
    [/href="\/es\/hornos?-rotativos?[^"]*"/g, `href="${DOMAIN}/es/hornos-rotativos"`],
    [/href="\/es\/vesuviobuono[^"]*"/g, `href="${DOMAIN}/es/sistema-vesuviobuono"`],
    [/href="\/es\/architettoai[^"]*"/g, `href="${DOMAIN}/es/architettoai"`],
    [/href="\/es\/arquitecto[^"]*"/g, `href="${DOMAIN}/es/architettoai"`],
    [/href="\/es\/listo-para-enviar[^"]*"/g, `href="${DOMAIN}/es/listo-para-enviar"`],
    [/href="\/es\/blog[^"]*"/g, `href="${DOMAIN}/es/blog"`],
    [/href="\/es\/?"/g, `href="${DOMAIN}/es"`],
  ],
};

function fixLinks(content: string, lang: string): string {
  let fixed = content;
  const rules = REPLACEMENTS[lang] || [];
  for (const [pattern, replacement] of rules) {
    fixed = fixed.replace(pattern, replacement);
  }
  // Catch any remaining relative links starting with / that aren't full domain
  fixed = fixed.replace(/href="\/([a-z]{2})(\/[^"]*)?"/g, (match, l, path) => {
    if (match.includes(DOMAIN)) return match;
    return `href="${DOMAIN}/${l}${path || ""}"`;
  });
  return fixed;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("id, content_it, content_en, content_fr, content_de, content_es");

    if (error) throw error;

    const results: { id: string; changes: Record<string, number> }[] = [];

    for (const post of posts || []) {
      const changes: Record<string, number> = {};
      const updates: Record<string, string> = {};

      for (const lang of ["it", "en", "fr", "de", "es"]) {
        const key = `content_${lang}`;
        const original = (post as any)[key] || "";
        const fixed = fixLinks(original, lang);
        if (fixed !== original) {
          updates[key] = fixed;
          // Count changes
          const origLinks = (original.match(/href="[^"]+"/g) || []).join("");
          const fixedLinks = (fixed.match(/href="[^"]+"/g) || []).join("");
          changes[lang] = origLinks !== fixedLinks ? 1 : 0;
        }
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from("blog_posts")
          .update(updates)
          .eq("id", post.id);

        if (updateError) {
          console.error(`Error updating post ${post.id}:`, updateError);
        }
        results.push({ id: post.id, changes });
      }
    }

    return new Response(JSON.stringify({ success: true, fixed: results.length, details: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Fix links error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
