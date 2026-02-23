import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pool of existing site images to use as base for AI cover generation
const SITE_IMAGES = [
  "/lovable-uploads/vesuviobuono-forno-legna.jpg",
  "/lovable-uploads/vesuviobuono-pizza-perfetta.jpg",
  "/lovable-uploads/vesuviobuono-forno-azione.jpg",
  "/lovable-uploads/vesuviobuono-verde-dettaglio.jpg",
  "/lovable-uploads/vesuviobuono-verde-mosaico.jpg",
  "/lovable-uploads/vesuviobuono-osteria-pizza.jpg",
  "/lovable-uploads/forno-gas-mosaico-azzurro.jpg",
  "/lovable-uploads/forno-mosaico-bianco.jpg",
  "/lovable-uploads/forno-mosaico-rosso.jpg",
  "/lovable-uploads/forno-arancione-terra-del-gusto.png",
  "/lovable-uploads/artigiano-lavorazione.jpg",
  "/lovable-uploads/artigiano-mani-argilla.jpg",
  "/lovable-uploads/mattoni-refrattari-hero.jpg",
  "/lovable-uploads/laboratorio-sant-anastasia.png",
  "/lovable-uploads/forni-colorati-showroom.png",
  "/lovable-uploads/vesuviobuono-marrone-aperto.jpg",
  "/lovable-uploads/vesuviobuono-zero-emissioni.jpg",
  "/lovable-uploads/forno-nero-elegante.png",
  "/lovable-uploads/metallico-design-ar.jpg",
  "/lovable-uploads/tradizionale-cupola-ar.jpg",
];

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

    // Pick a relevant base image based on topic keywords
    const topicLower = topic.toLowerCase();
    let baseImage: string;
    
    if (topicLower.includes("gas")) {
      baseImage = SITE_IMAGES[6]; // forno gas mosaico
    } else if (topicLower.includes("elettric")) {
      baseImage = SITE_IMAGES[17]; // forno nero elegante
    } else if (topicLower.includes("rotan") || topicLower.includes("rotativ")) {
      baseImage = SITE_IMAGES[18]; // metallico design
    } else if (topicLower.includes("vesuviobuono") || topicLower.includes("emissioni") || topicLower.includes("sostenibil")) {
      baseImage = SITE_IMAGES[16]; // zero emissioni
    } else if (topicLower.includes("pizza") || topicLower.includes("cottura") || topicLower.includes("ricett")) {
      baseImage = SITE_IMAGES[1]; // pizza perfetta
    } else if (topicLower.includes("artigian") || topicLower.includes("tradizi") || topicLower.includes("napol")) {
      baseImage = SITE_IMAGES[10]; // artigiano lavorazione
    } else if (topicLower.includes("laboratorio") || topicLower.includes("produzion")) {
      baseImage = SITE_IMAGES[13]; // laboratorio
    } else if (topicLower.includes("design") || topicLower.includes("mosaico") || topicLower.includes("rivestiment")) {
      baseImage = SITE_IMAGES[8]; // mosaico rosso
    } else if (topicLower.includes("refrattari") || topicLower.includes("material")) {
      baseImage = SITE_IMAGES[12]; // mattoni refrattari
    } else {
      // Random pick for generic topics
      baseImage = SITE_IMAGES[Math.floor(Math.random() * SITE_IMAGES.length)];
    }

    // Construct the full public URL for the base image
    const siteUrl = "https://vesuviano-forni-mondo.lovable.app";
    const baseImageUrl = `${siteUrl}${baseImage}`;

    console.log("Generating blog cover for topic:", topic, "using base image:", baseImage);

    const editPrompt = `Transform this photo of an artisan Italian pizza oven into a professional editorial blog cover image. 
Topic: "${topic}". 
Style: ${style || "warm Mediterranean editorial look, professional food/lifestyle photography"}. 
Make it 16:9 aspect ratio, add subtle warm color grading, enhance lighting to look like a high-end magazine cover. 
Do NOT add any text or overlays. Keep the oven/subject as the hero element but make the overall composition feel like a premium blog header image.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: editPrompt },
            { type: "image_url", image_url: { url: baseImageUrl } }
          ]
        }],
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
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image returned:", JSON.stringify(data).substring(0, 500));
      throw new Error("No image returned from AI");
    }

    // Upload to Supabase storage
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Convert base64 to bytes
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

    return new Response(JSON.stringify({ success: true, imageUrl: publicUrl.publicUrl, baseImage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-blog-cover error:", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
