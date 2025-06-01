
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, imageBase64 } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const stabilityApiKey = Deno.env.get('STABILITY_API_KEY');
    
    if (!stabilityApiKey) {
      return new Response(
        JSON.stringify({ error: 'STABILITY_API_KEY not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Generating image with Stability AI, prompt:', prompt);

    let requestBody;
    let endpoint;

    if (imageBase64) {
      // Image-to-image generation
      endpoint = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image';
      
      // Rimuovi il prefisso data:image se presente
      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      
      requestBody = JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        init_image: base64Data,
        cfg_scale: 7,
        image_strength: 0.4, // Mantiene più dell'immagine originale
        steps: 30,
        samples: 1,
      });
    } else {
      // Text-to-image generation (fallback)
      endpoint = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
      
      requestBody = JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
      });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stabilityApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stability AI error:', errorText);
      throw new Error(`Stability AI error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.artifacts || result.artifacts.length === 0) {
      throw new Error('No image generated');
    }

    const imageBase64Result = result.artifacts[0].base64;
    const imageUrl = `data:image/png;base64,${imageBase64Result}`;

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ 
        imageURL: imageUrl,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-image-stability function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate image', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
