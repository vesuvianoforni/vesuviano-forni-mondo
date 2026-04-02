import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildEditPrompt(topic: string, style?: string): string {
  const styleDesc = style || "warm Mediterranean editorial look, professional food/lifestyle photography, golden hour lighting";

  return `Transform this pizza oven photo into a professional editorial blog cover image (16:9 landscape format) about "${topic}". 
Style: ${styleDesc}. 
Keep the oven as the main subject but enhance the scene with beautiful composition, warm color grading, and soft natural lighting like a high-end magazine cover photo. 
Do NOT add any text, watermarks, logos, or overlays. The image should be purely photographic.`;
}

function ensureAbsoluteUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  // Relative paths like /lovable-uploads/... need the domain
  return `https://vesuvianoforni.com${url.startsWith("/") ? "" : "/"}${url}`;
}

async function fetchReferenceImages(supabase: any, topic: string): Promise<string[]> {
  const urls: string[] = [];

  // 1. Try configurator_ovens images (best quality product shots)
  const { data: ovens } = await supabase
    .from("configurator_ovens")
    .select("image_url, additional_images")
    .eq("is_active", true)
    .limit(10);

  if (ovens?.length) {
    for (const oven of ovens) {
      if (oven.image_url) urls.push(ensureAbsoluteUrl(oven.image_url));
      if (oven.additional_images?.length) {
        urls.push(...oven.additional_images.slice(0, 2).map(ensureAbsoluteUrl));
      }
    }
  }

  // 2. Also try oven-gallery bucket for more variety
  const { data: files } = await supabase.storage
    .from("oven-gallery")
    .list("", { limit: 20, sortBy: { column: "created_at", order: "desc" } });

  if (files?.length) {
    for (const file of files) {
      if (file.name && !file.name.startsWith("blog-covers/") && /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
        const { data: urlData } = supabase.storage.from("oven-gallery").getPublicUrl(file.name);
        if (urlData?.publicUrl) urls.push(urlData.publicUrl);
      }
    }
  }

  // Filter out any empty URLs
  const validUrls = urls.filter(u => u && u.startsWith("http"));

  // Pick a relevant image based on topic keywords, or random
  const t = topic.toLowerCase();
  const scored = validUrls.map(url => {
    const u = url.toLowerCase();
    let score = 0;
    if (t.includes("gas") && u.includes("gas")) score += 3;
    if (t.includes("elettric") && (u.includes("elettric") || u.includes("electric"))) score += 3;
    if (t.includes("rotan") && (u.includes("rotan") || u.includes("rotating"))) score += 3;
    if (t.includes("legna") && (u.includes("legna") || u.includes("wood"))) score += 3;
    if (t.includes("mosaico") && u.includes("mosaico")) score += 2;
    return { url, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top 1-2 unique images
  const unique = [...new Set(scored.map(s => s.url))];
  return unique.slice(0, 2);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { topic, style } = await req.json();
    if (!topic) {
      return new Response(JSON.stringify({ error: "Missing topic" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating blog cover for topic:", topic);

    // Fetch reference images from the site
    const refImages = await fetchReferenceImages(supabase, topic);
    console.log(`Found ${refImages.length} reference images`);

    const prompt = buildEditPrompt(topic, style);

    let messages: any[];

    if (refImages.length > 0) {
      // Use image editing mode with site photos as reference
      const content: any[] = [{ type: "text", text: prompt }];
      for (const imgUrl of refImages) {
        content.push({
          type: "image_url",
          image_url: { url: imgUrl },
        });
      }
      messages = [{ role: "user", content }];
      console.log("Using reference images:", refImages);
    } else {
      // Fallback: generate from scratch
      console.log("No reference images found, generating from scratch");
      messages = [{ role: "user", content: prompt }];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages,
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
