import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ovenName, color, imageUrl, coatingType } = await req.json();
    
    if (!ovenName || !color || !imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing ovenName, color, or imageUrl' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const coatingDescription = coatingType 
      ? `The oven currently has a "${coatingType}" coating/finish. You MUST preserve this exact same coating texture and pattern (e.g. if it's mosaic tiles, keep the mosaic tiles; if it's smooth paint, keep smooth paint; if it's stone texture, keep stone texture). `
      : '';

    const prompt = `Change ONLY the color of this pizza oven to ${color}. ${coatingDescription}CRITICAL INSTRUCTIONS: 1) DO NOT change the surface texture, coating type, or material pattern - preserve them EXACTLY as in the original photo. 2) If the oven has mosaic tiles, the result MUST still show mosaic tiles. 3) If the oven has a smooth painted surface, keep it smooth. 4) Maintain the exact same shape, structure, proportions, shadows, and lighting. 5) Only the COLOR/HUE should change, nothing else. The result should look like the exact same oven photographed with a different color applied to its existing coating.`;

    console.log('Editing oven image with color:', color, 'coating:', coatingType || 'not specified');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service payment required. Please contact support.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to generate image' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const data = await response.json();
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error('No image in response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'No image generated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ success: true, imageUrl: generatedImageUrl, imageURL: generatedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error in generate-oven-render:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unexpected error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
