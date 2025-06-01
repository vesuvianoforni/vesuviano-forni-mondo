

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

    let response;

    if (imageBase64) {
      // Image-to-image generation usando multipart/form-data
      console.log('Using image-to-image generation');
      
      // Rimuovi il prefisso data:image se presente
      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Converti base64 in Uint8Array
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log('Original image size:', bytes.length, 'bytes');

      // Crea FormData
      const formData = new FormData();
      formData.append('init_image', new File([bytes], 'image.png', { type: 'image/png' }));
      formData.append('text_prompts[0][text]', prompt);
      formData.append('text_prompts[0][weight]', '1');
      formData.append('cfg_scale', '7');
      formData.append('image_strength', '0.35'); // Permette più modifiche all'immagine originale
      formData.append('steps', '30');
      formData.append('samples', '1');

      response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stabilityApiKey}`,
          'Accept': 'application/json',
        },
        body: formData,
      });
    } else {
      // Text-to-image generation (fallback)
      console.log('Using text-to-image generation');
      
      response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stabilityApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      });
    }

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

