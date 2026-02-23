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
- slug: URL-friendly slug in that language (lowercase, hyphens, no special chars)
- title: SEO title (max 60 chars) with primary keyword
- meta_description: compelling meta description (max 155 chars) with call-to-action
- content: full HTML article (1200-2000 words) with:
  - <h2> and <h3> headings with keywords
  - Short paragraphs (2-3 sentences)
  - Bullet lists where appropriate
  - Internal linking suggestions as <a href="/LANG/...">
  - Natural keyword density (1-2%)
  - Engaging intro and strong conclusion with CTA
  - Semantic HTML (<p>, <ul>, <li>, <strong>, <em>)

The content must be NATIVE quality in each language, not just translated. Adapt idioms, cultural references, and search intent per market.

Company details to reference naturally:
- Brand: Vesuviano Forni
- Location: Sant'Anastasia, at the foot of Mount Vesuvius
- Products: wood-fired, gas, electric, and rotating pizza ovens
- USP: handcrafted refractory bricks, artisan tradition, international shipping
- Website sections: configurator, Architetto AI, VesuvioBuono model`;

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
    
    // Strip markdown code blocks if present
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    let article;
    try {
      article = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", cleaned.substring(0, 500));
      throw new Error("AI returned invalid JSON");
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
