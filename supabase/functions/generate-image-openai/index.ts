import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function dataUrlToBytes(dataUrl: string): Uint8Array {
  try {
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch (e) {
    console.error("Failed to convert data URL to bytes:", e);
    throw new Error("Invalid base64 image data");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      console.error("OPENAI_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const { prompt, imageBase64 } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing prompt" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("OpenAI image generation start. Has image:", !!imageBase64);

    let resultBase64: string | null = null;

    if (imageBase64) {
      // Use image edit when base image is provided
      const form = new FormData();
      form.append("model", "gpt-image-1");
      form.append("prompt", prompt);
      form.append("size", "1024x1024");
      form.append("n", "1");
      form.append("response_format", "b64_json");

      const bytes = dataUrlToBytes(imageBase64 as string);
      const file = new File([bytes], "image.png", { type: "image/png" });
      form.append("image", file);

      const resp = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${openAiKey}` },
        body: form,
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("OpenAI edits error:", resp.status, errText);
        return new Response(
          JSON.stringify({ error: `OpenAI edits failed: ${resp.statusText}`, details: errText }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const data = await resp.json();
      resultBase64 = data?.data?.[0]?.b64_json || null;
    } else {
      // Text-to-image
      const resp = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          size: "1024x1024",
          n: 1,
          response_format: "b64_json",
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("OpenAI generations error:", resp.status, errText);
        return new Response(
          JSON.stringify({ error: `OpenAI generations failed: ${resp.statusText}`, details: errText }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const data = await resp.json();
      resultBase64 = data?.data?.[0]?.b64_json || null;
    }

    if (!resultBase64) {
      console.error("No image returned by OpenAI");
      return new Response(
        JSON.stringify({ error: "No image returned by OpenAI" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const dataUrl = `data:image/png;base64,${resultBase64}`;

    return new Response(
      JSON.stringify({ success: true, imageUrl: dataUrl, imageURL: dataUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e: any) {
    console.error("Unexpected error in generate-image-openai:", e?.message || e);
    return new Response(
      JSON.stringify({ error: e?.message || "Unexpected error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});