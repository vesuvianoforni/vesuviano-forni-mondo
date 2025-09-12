import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { spaceImage, ovenType, ovenModel } = await req.json()
    
    if (!spaceImage || !ovenType || !ovenModel) {
      return new Response(
        JSON.stringify({ success: false, error: 'Parametri mancanti: spaceImage, ovenType e ovenModel sono richiesti' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('NANOBANANA_API_KEY')
    const baseUrl = Deno.env.get('NANOBANANA_API_BASE_URL') || 'https://api.nanobanana.com/v1/generate'
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key di Nanobanana non configurata' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prompt per la generazione dell'immagine
    const prompt = `Add a beautiful ${ovenModel} wood-fired pizza oven to this space. The oven should be professionally integrated into the environment, maintaining realistic lighting, shadows, and perspective. Make it look like it naturally belongs in this space. High quality, photorealistic result.`

    console.log('Generating image with prompt:', prompt)

    const imageBase64 = typeof spaceImage === 'string' && spaceImage.startsWith('data:')
      ? spaceImage.split(',')[1]
      : spaceImage;

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        // Common parameter names used by providers
        image: spaceImage,
        image_base64: imageBase64,
        init_image: imageBase64,
        model: 'flux-dev',
        width: 1024,
        height: 1024,
        steps: 20,
        guidance: 7.5,
        strength: 0.7, // preserve original environment
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Nanobanana API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Errore nella generazione dell\'immagine', 
          details: `Status: ${response.status}, Response: ${errorText}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await response.json()
    console.log('Nanobanana response:', result)

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: result.image_url || result.url,
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