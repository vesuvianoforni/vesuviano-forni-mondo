import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

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

    const { postId, targetLang } = await req.json();
    if (!postId || !targetLang) throw new Error("Missing postId or targetLang");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: post, error: fetchErr } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", postId)
      .single();
    if (fetchErr || !post) throw new Error("Post not found");

    const langNames: Record<string, string> = {
      en: "English", fr: "French", de: "German", es: "Spanish",
    };
    const langName = langNames[targetLang];
    if (!langName) throw new Error("Invalid targetLang: " + targetLang);

    const sourceContent = post.content_it;
    const sourceTitle = post.title_it;
    if (!sourceContent) throw new Error("No Italian content to translate from");

    const prompt = `You are a professional translator for Vesuviano Forni, an artisan Italian pizza oven manufacturer.

Translate the following blog article from Italian to ${langName}. The translation must be NATIVE quality — not literal. Adapt idioms, cultural references, and SEO keywords for the ${langName}-speaking market.

Original Italian title: ${sourceTitle}

Original Italian content (HTML):
${sourceContent}

Respond ONLY with a valid JSON object (no markdown, no code blocks):
{
  "content": "<translated HTML content>"
}`;

    console.log(`Translating post ${postId} to ${targetLang}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 16000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    let cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];

    const parsed = JSON.parse(cleaned);
    const translatedContent = parsed.content;
    if (!translatedContent || translatedContent.length < 50) {
      throw new Error("Translation too short or empty");
    }

    const updateData: Record<string, string> = {};
    updateData[`content_${targetLang}`] = translatedContent;

    const { error: updateErr } = await supabase
      .from("blog_posts")
      .update(updateData)
      .eq("id", postId);
    if (updateErr) throw updateErr;

    console.log(`Successfully translated to ${targetLang}, length: ${translatedContent.length}`);

    return new Response(JSON.stringify({ success: true, lang: targetLang, length: translatedContent.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("translate-blog-article error:", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
