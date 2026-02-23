import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Full portfolio of site images organized by category for variety
const IMAGE_POOL: Record<string, string[]> = {
  gas: [
    "/lovable-uploads/forno-gas-mosaico-azzurro.jpg",
    "/lovable-uploads/forno-gas-verde-mosaico.png",
    "/lovable-uploads/forno-mosaico-bianco.jpg",
    "/lovable-uploads/forno-mosaico-rosso.jpg",
    "/lovable-uploads/forno-mosaico-nero-beige.jpg",
    "/lovable-uploads/forno-mosaico-grigio-nero.jpg",
  ],
  electric: [
    "/lovable-uploads/forno-nero-elegante.png",
    "/lovable-uploads/forno-nero-metallico-nuovo.png",
    "/lovable-uploads/forno-metallo-nero.png",
    "/lovable-uploads/forno-metallo-nero-nuovo.png",
    "/lovable-uploads/forno-bianco-moderno.png",
  ],
  rotante: [
    "/lovable-uploads/metallico-design-ar.jpg",
    "/lovable-uploads/forno-rotativo-mosaico-nero.jpg",
    "/lovable-uploads/forno-rotativo-mosaico.png",
    "/lovable-uploads/forno-metallo-bianco.png",
    "/lovable-uploads/forno-metallo-bianco-nuovo.png",
  ],
  vesuviobuono: [
    "/lovable-uploads/vesuviobuono-zero-emissioni.jpg",
    "/lovable-uploads/vesuviobuono-forno-legna.jpg",
    "/lovable-uploads/vesuviobuono-verde-dettaglio.jpg",
    "/lovable-uploads/vesuviobuono-verde-mosaico.jpg",
    "/lovable-uploads/vesuviobuono-marrone-aperto.jpg",
    "/lovable-uploads/vesuviobuono-marrone-completo.jpg",
    "/lovable-uploads/vesuviobuono-ostepizza-aperto.jpg",
    "/lovable-uploads/vesuviobuono-ostepizza-completo.png",
    "/lovable-uploads/vesuviobuono-dettaglio-bocca.jpg",
  ],
  pizza: [
    "/lovable-uploads/vesuviobuono-pizza-perfetta.jpg",
    "/lovable-uploads/vesuviobuono-forno-azione.jpg",
    "/lovable-uploads/vesuviobuono-osteria-pizza.jpg",
    "/lovable-uploads/pizza-vico-event.png",
    "/lovable-uploads/forno-arancione-terra-del-gusto.png",
  ],
  artigianato: [
    "/lovable-uploads/artigiano-lavorazione.jpg",
    "/lovable-uploads/artigiano-mani-argilla.jpg",
    "/lovable-uploads/mattoni-refrattari-hero.jpg",
    "/lovable-uploads/laboratorio-sant-anastasia.png",
  ],
  design: [
    "/lovable-uploads/forno-mosaico-rosso.jpg",
    "/lovable-uploads/forno-mosaico-bianco.jpg",
    "/lovable-uploads/forno-mosaico-nero-beige.jpg",
    "/lovable-uploads/forno-mosaico-grigio-nero.jpg",
    "/lovable-uploads/forno-gas-verde-mosaico.png",
    "/lovable-uploads/forno-gas-mosaico-azzurro.jpg",
    "/lovable-uploads/forno-rotativo-mosaico.png",
    "/lovable-uploads/vesuviobuono-verde-mosaico.jpg",
    "/lovable-uploads/forni-colorati-showroom.png",
  ],
  showroom: [
    "/lovable-uploads/forni-colorati-showroom.png",
    "/lovable-uploads/logistica-internazionale-nyc.png",
    "/lovable-uploads/pizza-vico-event.png",
    "/lovable-uploads/laboratorio-sant-anastasia.png",
  ],
  pronta_consegna: [
    "/lovable-uploads/forno-pronta-consegna-1.png",
    "/lovable-uploads/forno-pronta-consegna-2.png",
    "/lovable-uploads/forno-pronta-consegna-3.png",
    "/lovable-uploads/forno-pronta-consegna-4.png",
    "/lovable-uploads/forno-pronta-consegna-5.png",
  ],
  tradizionale: [
    "/lovable-uploads/tradizionale-cupola-ar.jpg",
    "/lovable-uploads/vesuviobuono-forno-legna.jpg",
    "/lovable-uploads/vesuviobuono-marrone-aperto.jpg",
    "/lovable-uploads/vesuviobuono-marrone-completo.jpg",
    "/lovable-uploads/mattoni-refrattari-hero.jpg",
    "/lovable-uploads/forno-arancione-terra-del-gusto.png",
  ],
  metallico: [
    "/lovable-uploads/forno-metallo-bianco.png",
    "/lovable-uploads/forno-metallo-bianco-nuovo.png",
    "/lovable-uploads/forno-metallo-nero.png",
    "/lovable-uploads/forno-metallo-nero-nuovo.png",
    "/lovable-uploads/forno-nero-metallico-nuovo.png",
    "/lovable-uploads/metallico-design-ar.jpg",
    "/lovable-uploads/forno-bianco-moderno.png",
  ],
};

// Flat list of ALL images for generic fallback
const ALL_IMAGES = [...new Set(Object.values(IMAGE_POOL).flat())];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Match topic to multiple relevant categories, then pick randomly from the combined pool
function selectImage(topic: string): string {
  const t = topic.toLowerCase();
  const matched: string[] = [];

  const keywords: Record<string, string[]> = {
    gas: ["gas", "bruciatore", "fiamma"],
    electric: ["elettric", "electric", "électrique", "elektrisch"],
    rotante: ["rotan", "rotativ", "rotating", "tournant", "drehend"],
    vesuviobuono: ["vesuviobuono", "vesuvio buono", "emissioni", "sostenibil", "ecolog", "green"],
    pizza: ["pizza", "cottura", "ricett", "cuoci", "cuocere", "cooking", "baking", "recette"],
    artigianato: ["artigian", "handcraft", "artisan", "fatto a mano", "handmade", "lavorazione", "tradizion"],
    design: ["design", "mosaico", "rivestiment", "colore", "color", "personalizzaz", "custom"],
    showroom: ["showroom", "evento", "event", "fiera", "exhibition", "esposiz"],
    pronta_consegna: ["pronta consegna", "ready to ship", "immediat", "disponibil", "stock"],
    tradizionale: ["tradizional", "legna", "wood", "cupola", "napoletan", "classico"],
    metallico: ["metallic", "acciaio", "steel", "inox", "moderno", "modern", "professionale"],
  };

  for (const [cat, kws] of Object.entries(keywords)) {
    if (kws.some(kw => t.includes(kw))) {
      matched.push(...(IMAGE_POOL[cat] || []));
    }
  }

  // Deduplicate
  const unique = [...new Set(matched)];
  
  // If matches found, pick randomly from them; otherwise pick from entire portfolio
  return pickRandom(unique.length > 0 ? unique : ALL_IMAGES);
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

    const baseImage = selectImage(topic);
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

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
