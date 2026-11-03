import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { generateEconomicImage } from '../_shared/economic-images.ts';

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

    const apiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key di Gemini non configurata' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create prompt in Italian - more explicit about using the provided oven image
    const prompt = ovenImage 
      ? `Nella prima immagine vedi uno spazio/ambiente. Nella seconda immagine vedi un forno (modello "${ovenModel}"). Il tuo compito è inserire ESATTAMENTE il forno della seconda immagine nello spazio della prima immagine, mantenendo tutte le caratteristiche del forno (colore, forma, dettagli). Rispetta prospettiva, illuminazione e ombre dell'ambiente. Se c'è già un altro forno nell'ambiente, sostituiscilo completamente con il forno fornito nella seconda immagine.`
      : `Inserisci il forno selezionato "${ovenModel}" nella foto caricata in fotorealismo, senza alterare la foto caricata, semplicemente inserendo il forno in modo equilibrato e naturale. Qualora ci sia già un altro forno presente nell'immagine, sostituiscilo completamente con il nostro forno selezionato. Il forno deve integrarsi perfettamente nell'ambiente rispettando prospettiva, illuminazione e ombre.`;

    console.log('Generating image with Gemini. Has oven image:', !!ovenImage);
    console.log('Prompt:', prompt);

    const imageDataUrl = await generateEconomicImage(prompt, ovenImage ? [spaceImage, ovenImage] : [spaceImage]);

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: imageDataUrl,
        prompt: prompt
      }),
      { status: typeof error === 'object' && error && 'status' in error ? Number(error.status) : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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