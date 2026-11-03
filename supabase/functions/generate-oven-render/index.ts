import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateEconomicImage } from '../_shared/economic-images.ts';

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

    const generatedImageUrl = await generateEconomicImage(prompt, [imageUrl]);

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ success: true, imageUrl: generatedImageUrl, imageURL: generatedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error in generate-oven-render:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unexpected error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: error?.status ?? 500 }
    );
  }
});
