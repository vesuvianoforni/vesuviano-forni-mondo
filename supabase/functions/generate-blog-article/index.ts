import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { topic, keywords, tone } = await req.json();
    if (!topic) {
      return new Response(JSON.stringify({ error: "Missing topic" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an expert SEO content writer for Vesuviano Forni, an artisan Italian company that manufactures professional wood-fired, gas, and electric pizza ovens in Sant'Anastasia (Naples). 

Your task is to generate a complete, SEO-optimized blog article in ALL 5 languages: Italian, English, French, German, Spanish.

For EACH language, produce:
- slug: URL-friendly slug in that language (lowercase, hyphens, no special chars, NO accented characters — use ascii only)
- title: SEO title (max 60 chars) with primary keyword
- meta_description: compelling meta description (max 155 chars) with call-to-action
- content: full HTML article (1200-2000 words) with:
  - <h2> and <h3> headings with keywords
  - Short paragraphs (2-3 sentences)
  - Bullet lists where appropriate
  - Internal links using the FULL domain https://vesuvianoforni.com as base URL. Use the correct language prefix. Examples:
    - Italian: <a href="https://vesuvianoforni.com/it/forni-tradizionali">forni tradizionali</a>
    - English: <a href="https://vesuvianoforni.com/en/traditional-ovens">traditional ovens</a>
    - French: <a href="https://vesuvianoforni.com/fr/fours-traditionnels">fours traditionnels</a>
    - German: <a href="https://vesuvianoforni.com/de/traditionelle-oefen">traditionelle Öfen</a>
    - Spanish: <a href="https://vesuvianoforni.com/es/hornos-tradicionales">hornos tradicionales</a>
  - Available pages per language (use the correct lang prefix):
    - Home: /{lang}
    - Traditional ovens: /it/forni-tradizionali, /en/traditional-ovens, /fr/fours-traditionnels, /de/traditionelle-oefen, /es/hornos-tradicionales
    - Gas ovens: /it/forni-gas, /en/gas-ovens, /fr/fours-gaz, /de/gasoefen, /es/hornos-gas
    - Electric ovens: /it/forni-elettrici, /en/electric-ovens, /fr/fours-electriques, /de/elektrooefen, /es/hornos-electricos
    - Rotating ovens: /it/forni-rotanti, /en/rotating-ovens, /fr/fours-rotatifs, /de/drehoefen, /es/hornos-rotativos
    - VesuvioBuono: /it/sistema-vesuviobuono, /en/vesuviobuono-system, /fr/systeme-vesuviobuono, /de/vesuviobuono-system, /es/sistema-vesuviobuono
    - Ready to ship: /it/pronta-consegna, /en/ready-to-ship, /fr/pret-a-expedier, /de/versandfertig, /es/listo-para-enviar
    - Architetto AI: /it/architettoai, /en/architettoai, /fr/architettoai, /de/architettoai, /es/architettoai
    - Blog: /it/blog, /en/blog, /fr/blog, /de/blog, /es/blog
  - IMPORTANT: Always use https://vesuvianoforni.com as base domain for ALL internal links. Never use relative paths.
  - Natural keyword density (1-2%)
  - Engaging intro and strong conclusion with CTA
  - Semantic HTML (<p>, <ul>, <li>, <strong>, <em>)

The content must be NATIVE quality in each language, not just translated. Adapt idioms, cultural references, and search intent per market.

Company details to reference naturally:
- Brand: Vesuviano Forni
- Location: Sant'Anastasia, at the foot of Mount Vesuvius
- Products: wood-fired, gas, electric, and rotating pizza ovens
- USP: handcrafted refractory bricks, artisan tradition, international shipping
- Website: https://vesuvianoforni.com`;

    const userPrompt = `Generate a complete SEO blog article about: "${topic}"
${keywords ? `Target keywords: ${keywords}` : ""}
${tone ? `Tone: ${tone}` : "Tone: professional yet warm, authoritative"}

Respond ONLY with a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "slug_it": "...", "slug_en": "...", "slug_fr": "...", "slug_de": "...", "slug_es": "...",
  "title_it": "...", "title_en": "...", "title_fr": "...", "title_de": "...", "title_es": "...",
  "meta_description_it": "...", "meta_description_en": "...", "meta_description_fr": "...", "meta_description_de": "...", "meta_description_es": "...",
  "content_it": "...", "content_en": "...", "content_fr": "...", "content_de": "...", "content_es": "...",
  "category": "general|guide|ricette|novita|tecnica"
}`;

    console.log("Generating blog article for topic:", topic);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 40000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const finishReason = data.choices?.[0]?.finish_reason;
    
    if (finishReason === "length") {
      console.error("AI response was truncated (finish_reason=length)");
      throw new Error("La risposta AI è stata troncata. Riprova con un argomento più specifico.");
    }
    
    // Strip markdown code blocks if present
    let cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    // Try to extract JSON object from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    
    let article;
    try {
      article = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", cleaned.substring(0, 500));
      throw new Error("AI returned invalid JSON. Riprova.");
    }
    
    // Validate required fields for ALL languages
    const langs = ["it", "en", "fr", "de", "es"];
    const fieldTypes = ["slug", "title", "content"];
    const missingFields: string[] = [];
    for (const lang of langs) {
      for (const ft of fieldTypes) {
        const key = `${ft}_${lang}`;
        if (!article[key] || (typeof article[key] === "string" && article[key].trim().length < 5)) {
          missingFields.push(key);
        }
      }
    }
    if (missingFields.length > 0) {
      console.error("Missing or empty fields:", missingFields.join(", "));
      throw new Error(`Articolo incompleto: mancano ${missingFields.join(", ")}. Riprova.`);
    }

    return new Response(JSON.stringify({ success: true, article }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-blog-article error:", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
