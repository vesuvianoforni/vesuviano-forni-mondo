import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map topic keywords to visual scene descriptions for the AI
function buildScenePrompt(topic: string, style?: string): string {
  const t = topic.toLowerCase();
  let scene = "";

  if (t.includes("gas") || t.includes("bruciatore") || t.includes("fiamma")) {
    scene = "a beautiful artisan mosaic-tiled gas pizza oven with visible blue flames, in a professional pizzeria setting";
  } else if (t.includes("elettric") || t.includes("electric")) {
    scene = "a sleek modern black metal electric pizza oven in a contemporary restaurant kitchen";
  } else if (t.includes("rotan") || t.includes("rotativ") || t.includes("rotating")) {
    scene = "a professional rotating pizza oven with mosaic tiles, showing the rotating floor mechanism";
  } else if (t.includes("vesuviobuono") || t.includes("emissioni") || t.includes("ecolog")) {
    scene = "an eco-friendly wood-fired pizza oven with green mosaic tiles, in a garden setting with plants";
  } else if (t.includes("pizza") || t.includes("cottura") || t.includes("ricett")) {
    scene = "a perfectly baked Neapolitan pizza coming out of a traditional wood-fired oven with flames in the background";
  } else if (t.includes("artigian") || t.includes("handcraft") || t.includes("tradizion")) {
    scene = "artisan hands crafting refractory bricks for a pizza oven in an Italian workshop";
  } else if (t.includes("design") || t.includes("mosaico") || t.includes("rivestiment") || t.includes("color")) {
    scene = "a stunning colorful mosaic-tiled pizza oven in Mediterranean blue and terracotta tones";
  } else if (t.includes("legna") || t.includes("wood") || t.includes("napoletan")) {
    scene = "a traditional Neapolitan dome-shaped wood-fired pizza oven with burning logs inside";
  } else if (t.includes("metallic") || t.includes("acciaio") || t.includes("modern") || t.includes("professionale")) {
    scene = "a professional stainless steel pizza oven in a modern commercial kitchen";
  } else {
    scene = `a premium Italian artisan pizza oven related to: ${topic}`;
  }

  const styleDesc = style || "warm Mediterranean editorial look, professional food/lifestyle photography, golden hour lighting";

  return `Generate a professional editorial blog cover image (16:9 landscape format) showing ${scene}. 
Style: ${styleDesc}. 
The image should look like a high-end magazine cover photo with warm color grading, beautiful composition, and soft natural lighting. 
Do NOT add any text, watermarks, logos, or overlays. The image should be purely photographic.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { topic, style } = await req.json();
    if (!topic) {
      return new Response(JSON.stringify({ error: "Missing topic" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildScenePrompt(topic, style);
    console.log("Generating blog cover for topic:", topic);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Image generation error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted, please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image returned:", JSON.stringify(data).substring(0, 500));
      throw new Error("No image returned from AI");
    }

    // Upload to Supabase Storage
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const base64Data = imageUrl.split(",")[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const fileName = `blog-covers/${Date.now()}-${topic.replace(/[^a-z0-9]/gi, "-").substring(0, 40)}.png`;

    const { error: uploadError } = await supabase.storage
      .from("oven-gallery")
      .upload(fileName, bytes, { contentType: "image/png", upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload cover image");
    }

    const { data: publicUrl } = supabase.storage
      .from("oven-gallery")
      .getPublicUrl(fileName);

    console.log("Blog cover generated successfully:", publicUrl.publicUrl);

    return new Response(JSON.stringify({ success: true, imageUrl: publicUrl.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-blog-cover error:", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
