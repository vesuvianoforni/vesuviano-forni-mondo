// Legacy function name retained for existing callers; shared economical image model.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateEconomicImage } from '../_shared/economic-images.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { prompt, imageBase64 } = await req.json();
    if (typeof prompt !== 'string' || !prompt.trim()) return new Response(
      JSON.stringify({ error: 'Descrivi l’immagine da generare.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
    const imageUrl = await generateEconomicImage(prompt, imageBase64 ? [imageBase64] : []);
    return new Response(JSON.stringify({ success: true, imageUrl, imageURL: imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const failure = error as { message?: string; status?: number };
    return new Response(JSON.stringify({ success: false, error: failure.message ?? 'Generazione immagine non completata.' }), {
      status: failure.status ?? 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
