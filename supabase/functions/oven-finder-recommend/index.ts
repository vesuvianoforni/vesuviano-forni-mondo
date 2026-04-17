import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface QuizAnswers {
  usage: "pizzeria" | "private" | string;
  covers?: string;
  style?: string;
  fuel?: string;
  name: string;
  email: string;
  phone: string;
  lang?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as QuizAnswers;
    const { usage, covers, style, fuel, name, email, phone, lang = "en" } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !usage) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Save the lead
    const { data: lead } = await supabase
      .from("website_leads")
      .insert({
        first_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        form_type: "oven_finder_quiz",
        status: "new",
        oven_type: fuel || null,
        notes: `Quiz: usage=${usage} | covers=${covers || "n/a"} | style=${style || "n/a"} | fuel=${fuel || "any"}`,
        metadata: { usage, covers, style, fuel, lang },
      })
      .select()
      .single();

    // Fetch active ovens
    const { data: ovens } = await supabase
      .from("configurator_ovens")
      .select("model_name, description, diameter, fuel_type, pizza_capacity, sizes, base_price_a")
      .eq("is_active", true);

    // Build a compact catalog summary for the AI
    const catalog = (ovens || []).map((o) => ({
      model: o.model_name,
      diameter_cm: o.diameter,
      fuels: o.fuel_type,
      capacity: o.pizza_capacity,
      description: o.description?.slice(0, 200),
    }));

    let aiMessage = "";
    let recommendedModel = "";

    if (LOVABLE_API_KEY && catalog.length > 0) {
      const systemPrompt = `You are an expert advisor for Vesuviano, a Neapolitan artisan oven manufacturer. Based on the customer's needs, recommend the BEST single oven model from the catalog. Reply ONLY in language code "${lang}". Be warm, concise (max 4 short sentences), and specific. Mention the model name, why it fits, and one practical benefit. Do not invent prices.`;

      const userPrompt = `Customer profile:
- Usage: ${usage}
- Covers/seats: ${covers || "not specified"}
- Pizzeria style: ${style || "not specified"}
- Fuel preference: ${fuel || "no preference"}
- Name: ${name}

Available catalog:
${JSON.stringify(catalog, null, 2)}

Pick the single best model and explain in 3-4 sentences why it's perfect for this customer.`;

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
          tools: [
            {
              type: "function",
              function: {
                name: "recommend_oven",
                description: "Provide the recommended oven and explanation",
                parameters: {
                  type: "object",
                  properties: {
                    model_name: { type: "string", description: "Exact model name from the catalog" },
                    explanation: {
                      type: "string",
                      description: "Personalized explanation in the requested language, 3-4 sentences",
                    },
                  },
                  required: ["model_name", "explanation"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "recommend_oven" } },
        }),
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            recommendedModel = args.model_name || "";
            aiMessage = args.explanation || "";
          } catch (e) {
            console.error("Parse tool call failed", e);
          }
        }
      } else if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        console.error("AI gateway error", aiRes.status, await aiRes.text());
      }
    }

    // Fallback if AI failed
    if (!recommendedModel && catalog.length > 0) {
      recommendedModel = catalog[0].model;
      aiMessage =
        "Our expert will contact you shortly with a personalized recommendation based on your needs.";
    }

    // Find the matched oven for image
    const matched = ovens?.find(
      (o) => o.model_name?.toLowerCase() === recommendedModel.toLowerCase(),
    );

    return new Response(
      JSON.stringify({
        leadId: lead?.id,
        recommendation: {
          model_name: recommendedModel,
          explanation: aiMessage,
          diameter: matched?.diameter,
          capacity: matched?.pizza_capacity,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("oven-finder-recommend error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
