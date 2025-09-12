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
        JSON.stringify({ error: 'Parametri mancanti: spaceImage, ovenType e ovenModel sono richiesti' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const apiKey = Deno.env.get('NANOBANANA_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key di Nanobanana non configurata' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Prompt per la generazione dell'immagine
    const prompt = `Add a beautiful ${ovenModel} wood-fired pizza oven to this space. The oven should be professionally integrated into the environment, maintaining realistic lighting, shadows, and perspective. Make it look like it naturally belongs in this space. High quality, photorealistic result.`

    console.log('Generating image with prompt:', prompt)

    const response = await fetch('https://api.nanobanana.com/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image: spaceImage, // base64 image
        model: 'flux-dev',
        width: 1024,
        height: 1024,
        steps: 20,
        guidance: 7.5,
        strength: 0.7, // per preservare l'ambiente originale
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Nanobanana API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Errore nella generazione dell\'immagine', 
          details: `Status: ${response.status}, Response: ${errorText}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
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
        error: 'Errore interno del server', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})