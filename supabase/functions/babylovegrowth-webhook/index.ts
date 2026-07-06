import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LANGS: Record<string, string> = {
  it: "Italian",
  fr: "French",
  de: "German",
  es: "Spanish",
};

type BlogWebhookPayload = Record<string, any>;

// Slugify for non-Italian target languages when the payload doesn't provide one.
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

async function translate(
  apiKey: string,
  sourceTitle: string,
  sourceHtml: string,
  targetLang: string,
): Promise<{ title: string; content: string; meta_description: string; slug: string }> {
  const langName = LANGS[targetLang];
  const prompt = `You are a professional SEO translator for Vesuviano Forni, an artisan Italian pizza oven manufacturer based in Sant'Anastasia (Naples).

Translate the following blog article from English to ${langName}. The translation must be NATIVE quality — adapt idioms, cultural references, and SEO keywords for the ${langName}-speaking market. Preserve all HTML tags exactly. Preserve <a href="..."> URLs but translate the visible link text.

For internal links to https://vesuvianoforni.com/en/..., rewrite the language prefix to /${targetLang}/ and use the localized path when possible:
- /en/traditional-ovens → IT: /it/forni-tradizionali, FR: /fr/fours-traditionnels, DE: /de/traditionelle-oefen, ES: /es/hornos-tradicionales
- /en/gas-ovens → IT: /it/forni-gas, FR: /fr/fours-gaz, DE: /de/gasoefen, ES: /es/hornos-gas
- /en/electric-ovens → IT: /it/forni-elettrici, FR: /fr/fours-electriques, DE: /de/elektrooefen, ES: /es/hornos-electricos
- /en/rotating-ovens → IT: /it/forni-rotanti, FR: /fr/fours-rotatifs, DE: /de/drehoefen, ES: /es/hornos-rotativos
- /en/blog → /${targetLang}/blog

Original English title: ${sourceTitle}

Original English content (HTML):
${sourceHtml}

Respond ONLY with a valid JSON object (no markdown, no code blocks):
{
  "title": "translated SEO title, max 60 chars",
  "meta_description": "translated meta description, max 155 chars, with call-to-action",
  "slug": "url-friendly slug in ${langName}, lowercase ascii, hyphens only, no accents",
  "content": "<translated HTML content preserving all tags>"
}`;

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      max_tokens: 16000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI translation to ${targetLang} failed: ${resp.status} ${t}`);
  }
  const data = await resp.json();
  const raw = data.choices?.[0]?.message?.content || "";
  let cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) cleaned = m[0];
  const parsed = JSON.parse(cleaned);
  if (!parsed.content || !parsed.title) throw new Error(`Invalid translation JSON for ${targetLang}`);
  return {
    title: parsed.title,
    content: parsed.content,
    meta_description: parsed.meta_description || "",
    slug: (parsed.slug && slugify(parsed.slug)) || slugify(parsed.title),
  };
}

async function publishArticleInBackground(body: BlogWebhookPayload) {
  const title: string =
    body.title || body.title_en || body.article?.title || body.name || "";
  const content: string =
    body.content || body.content_html || body.html || body.body ||
    body.article?.content || body.article?.html || "";
  const metaDescription: string =
    body.meta_description || body.metaDescription || body.description ||
    body.excerpt || body.article?.meta_description || "";
  const providedSlug: string =
    body.slug || body.slug_en || body.article?.slug || "";
  const featuredImage: string | null =
    body.featured_image || body.heroImageUrl || body.image || body.cover_image ||
    body.article?.featured_image || null;
  const category: string = body.category || "general";
  const author: string = body.author || "Vesuviano Forni";

  if (!title || !content) {
    console.error("[babylovegrowth-webhook] Background skipped: missing title/content");
    return;
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const slugEn = providedSlug ? slugify(providedSlug) : slugify(title);
  console.log(`[babylovegrowth-webhook] Processing article: "${title}"`);

  const { data: existing, error: existingError } = await supabase
    .from("blog_posts")
    .select("id, slug_en, slug_it")
    .eq("slug_en", slugEn)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) {
    console.log(`[babylovegrowth-webhook] Article already exists ${existing.id}`);
    return;
  }

  // --- Translate to IT/FR/DE/ES in parallel ---
  const [it, fr, de, es] = await Promise.all([
    translate(LOVABLE_API_KEY, title, content, "it"),
    translate(LOVABLE_API_KEY, title, content, "fr"),
    translate(LOVABLE_API_KEY, title, content, "de"),
    translate(LOVABLE_API_KEY, title, content, "es"),
  ]);

  const row = {
    slug_en: slugEn,
    slug_it: it.slug,
    slug_fr: fr.slug,
    slug_de: de.slug,
    slug_es: es.slug,
    title_en: title,
    title_it: it.title,
    title_fr: fr.title,
    title_de: de.title,
    title_es: es.title,
    meta_description_en: metaDescription || null,
    meta_description_it: it.meta_description || null,
    meta_description_fr: fr.meta_description || null,
    meta_description_de: de.meta_description || null,
    meta_description_es: es.meta_description || null,
    content_en: content,
    content_it: it.content,
    content_fr: fr.content,
    content_de: de.content,
    content_es: es.content,
    featured_image: featuredImage,
    category,
    author,
    is_published: true,
    published_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("blog_posts")
    .insert(row)
    .select("id, slug_en, slug_it")
    .single();

  if (error) {
    if (error.code === "23505") {
      console.log(`[babylovegrowth-webhook] Duplicate article skipped: ${error.message}`);
      return;
    }

    console.error("[babylovegrowth-webhook] Insert error:", error);
    throw error;
  }

  console.log(`[babylovegrowth-webhook] Published post ${data.id}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // --- Auth: shared secret (Bearer token, custom header, or query string) ---
    const expected = Deno.env.get("BLOG_WEBHOOK_SECRET");
    if (!expected) throw new Error("BLOG_WEBHOOK_SECRET not configured");

    // Log every incoming header to diagnose which auth scheme the sender uses
    const headerDump: Record<string, string> = {};
    req.headers.forEach((v, k) => {
      const lowerKey = k.toLowerCase();
      headerDump[k] = lowerKey.includes("auth") || lowerKey.includes("secret") || lowerKey.includes("sign") || lowerKey.includes("token") || lowerKey.includes("api-key")
        ? `${v.slice(0, 6)}…(${v.length} chars)`
        : v;
    });
    console.log("[babylovegrowth-webhook] Headers:", JSON.stringify(headerDump));
    console.log("[babylovegrowth-webhook] URL:", req.url);

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const bearer = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";
    const provided =
      bearer ||
      authHeader ||
      req.headers.get("x-webhook-secret") ||
      req.headers.get("x-api-key") ||
      req.headers.get("x-babylovegrowth-secret") ||
      req.headers.get("x-signature") ||
      new URL(req.url).searchParams.get("secret") ||
      new URL(req.url).searchParams.get("token");

    console.log(
      `[babylovegrowth-webhook] Provided length: ${provided?.length ?? 0}, expected length: ${expected.length}, match: ${provided === expected}`,
    );

    if (provided !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    // --- Parse payload (flexible: accept common Babylovegrowth field names) ---
    const body = await req.json();
    const title: string =
      body.title || body.title_en || body.article?.title || body.name || "";
    const content: string =
      body.content || body.content_html || body.html || body.body ||
      body.article?.content || body.article?.html || "";

    if (!title || !content) {
      return new Response(JSON.stringify({
        error: "Missing required fields: title, content",
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`[babylovegrowth-webhook] Accepted article: "${title}"`);
    EdgeRuntime.waitUntil(
      publishArticleInBackground(body).catch((error) => {
        console.error("[babylovegrowth-webhook] Background error:", error?.message || error);
      }),
    );

    return new Response(JSON.stringify({
      success: true,
      accepted: true,
      message: "Article accepted for background publishing",
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[babylovegrowth-webhook] Error:", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
