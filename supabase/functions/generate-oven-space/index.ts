import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function dataUrlToBase64(dataUrl: string): string {
  const [, base64] = dataUrl.split(',');
  return base64;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { spaceImage, ovenType, ovenModel, ovenImage } = await req.json()

    if (!spaceImage || !ovenType || !ovenModel) {
      return new Response(
        JSON.stringify({ success: false, error: 'Parametri mancanti: spaceImage, ovenType e ovenModel sono richiesti' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key di Gemini non configurata' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract base64 from data URL
    const base64Image = dataUrlToBase64(spaceImage);
    const mimeType = spaceImage.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

    // Create prompt in Italian as per user's example
    const prompt = `Inserisci il forno selezionato "${ovenModel}" nella foto caricata in fotorealismo, senza alterare la foto caricata, semplicemente inserendo il forno in modo equilibrato e naturale. Qualora ci sia già un altro forno presente nell'immagine, sostituiscilo completamente con il nostro forno selezionato. Il forno deve integrarsi perfettamente nell'ambiente rispettando prospettiva, illuminazione e ombre.`;

    console.log('Generating image with Gemini. Prompt:', prompt);

    // Call Gemini API for image editing (text-and-image-to-image)
    const contentsParts: any[] = [];
    // Order: space image -> instruction -> oven image (if provided) -> extra guidance
    contentsParts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    });
    contentsParts.push({ text: prompt });

    if (ovenImage) {
      // support data URL or pure base64
      const ovenB64 = ovenImage.includes(',') ? dataUrlToBase64(ovenImage) : ovenImage;
      const ovenMime = ovenImage.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
      contentsParts.push({
        inlineData: {
          mimeType: ovenMime,
          data: ovenB64,
        },
      });
      contentsParts.push({
        text: 'Integra il forno nella scena rispettando prospettiva, scala, luce e ombre. Se presente un altro forno, sostituiscilo completamente con quello selezionato.'
      });
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent',
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: contentsParts }],
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Errore nella generazione dell\'immagine con Gemini', 
          details: `Status: ${response.status}, Response: ${errorText}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await response.json()
    console.log('Gemini response structure:', JSON.stringify(result, null, 2));

    // Extract generated image from response
    let generatedImageData = null;
    
    if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedImageData = part.inlineData.data;
          break;
        }
        if (part.inline_data && part.inline_data.data) {
          generatedImageData = part.inline_data.data;
          break;
        }
      }
    }

    if (!generatedImageData) {
      console.error('No image found in Gemini response:', result);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Nessuna immagine generata nella risposta di Gemini',
          details: JSON.stringify(result)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convert base64 to data URL for frontend display
    const imageDataUrl = `data:image/png;base64,${generatedImageData}`;

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: imageDataUrl,
        prompt: prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-oven-space function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Errore interno del server', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})