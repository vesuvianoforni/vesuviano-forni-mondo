import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DOMAIN = "https://www.vesuvianoforni.com";
const LANGS = ["it", "en", "fr", "de", "es"] as const;

const staticPages = [
  { paths: { it: "/it", en: "/en", fr: "/fr", de: "/de", es: "/es" }, priority: "1.0", changefreq: "weekly" },
  { paths: { it: "/it/forni-tradizionali", en: "/en/traditional-ovens", fr: "/fr/fours-traditionnels", de: "/de/traditionelle-oefen", es: "/es/hornos-tradicionales" }, priority: "0.9", changefreq: "monthly" },
  { paths: { it: "/it/forni-gas", en: "/en/gas-ovens", fr: "/fr/fours-gaz", de: "/de/gasoefen", es: "/es/hornos-gas" }, priority: "0.9", changefreq: "monthly" },
  { paths: { it: "/it/forni-elettrici", en: "/en/electric-ovens", fr: "/fr/fours-electriques", de: "/de/elektrooefen", es: "/es/hornos-electricos" }, priority: "0.9", changefreq: "monthly" },
  { paths: { it: "/it/forni-rotanti", en: "/en/rotating-ovens", fr: "/fr/fours-rotatifs", de: "/de/drehoefen", es: "/es/hornos-rotativos" }, priority: "0.9", changefreq: "monthly" },
  { paths: { it: "/it/sistema-vesuviobuono", en: "/en/vesuviobuono-system", fr: "/fr/systeme-vesuviobuono", de: "/de/vesuviobuono-system", es: "/es/sistema-vesuviobuono" }, priority: "0.9", changefreq: "monthly" },
  { paths: { it: "/it/pronta-consegna", en: "/en/ready-to-ship", fr: "/fr/pret-a-expedier", de: "/de/versandfertig", es: "/es/listo-para-enviar" }, priority: "0.8", changefreq: "weekly" },
  { paths: { it: "/it/architettoai", en: "/en/architettoai", fr: "/fr/architettoai", de: "/de/architettoai", es: "/es/architettoai" }, priority: "0.8", changefreq: "monthly" },
  { paths: { it: "/it/blog", en: "/en/blog", fr: "/fr/blog", de: "/de/blog", es: "/es/blog" }, priority: "0.8", changefreq: "daily" },
];

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function buildUrl(paths: Record<string, string>, lang: string, priority: string, changefreq: string, lastmod: string) {
  const hreflangs = LANGS.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l}" href="${DOMAIN}${escapeXml(paths[l])}" />`
  ).join("\n");
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}${escapeXml(paths.it)}" />`;

  return `  <url>
    <loc>${DOMAIN}${escapeXml(paths[lang])}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangs}
${xDefault}
  </url>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split("T")[0];
    const urls: string[] = [];

    // Static pages — one <url> per lang
    for (const page of staticPages) {
      for (const lang of LANGS) {
        urls.push(buildUrl(page.paths, lang, page.priority, page.changefreq, today));
      }
    }

    // Blog posts
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug_it, slug_en, slug_fr, slug_de, slug_es, updated_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (posts) {
      for (const post of posts) {
        const lastmod = (post.updated_at || today).split("T")[0];
        const paths: Record<string, string> = {};
        for (const lang of LANGS) {
          const slug = (post as any)[`slug_${lang}`];
          paths[lang] = `/${lang}/blog/${slug}`;
        }
        for (const lang of LANGS) {
          urls.push(buildUrl(paths, lang, "0.7", "monthly", lastmod));
        }
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", { status: 500, headers: corsHeaders });
  }
});
