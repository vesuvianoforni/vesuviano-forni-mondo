import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANG_NAMES: Record<string, string> = {
  it: "italiano", en: "English", fr: "français", de: "Deutsch", es: "español"
};

function buildSystemPrompt(lang: string) {
  const langName = LANG_NAMES[lang] || "English";
  return `You are the AI assistant for Vesuviano, artisan Neapolitan manufacturers of professional pizza ovens.

KEY INFORMATION ABOUT VESUVIANO:
- We produce wood-fired, gas, electric and rotating ovens for professional pizzerias
- Based in Naples, Italy
- Our ovens are exported worldwide
- We also offer the VesuvioBuono system (zero-emission oven)
- "Built on Place" service for custom installations
- Ovens available for immediate delivery
- Phone: 081 19231684
- Email: info@vesuvianoforni.com
- Our ovens fit through narrow spaces as small as 45cm wide

MAIN MODELS:
- Traditional wood-fired ovens (various diameters)
- Gas ovens
- Electric ovens
- Rotating ovens
- VesuvioBuono system (innovative, zero emissions)

BEHAVIOR:
- ALWAYS respond in ${langName} (the customer's browser language)
- Be friendly and professional
- Guide the customer toward a free consultation or quote
- Do NOT invent specific prices, suggest requesting a personalized quote
- Be concise but helpful, maximum 3-4 sentences per response
- Do NOT include the phrase "Lascia i tuoi dati" - the contact form is handled separately by the UI`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, lang } = await req.json();
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not set");

    const systemPrompt = buildSystemPrompt(lang || "en");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI error: ${err}`);
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
