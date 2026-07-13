// Temporary one-off function to generate background music via ElevenLabs.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'missing key' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const url = new URL(req.url);
  const duration = Number(url.searchParams.get('duration') ?? '36000'); // ms
  const prompt =
    url.searchParams.get('prompt') ??
    'Warm, elegant Italian acoustic instrumental. Soft classical guitar and mandolin, cinematic and inviting, gentle rhythm, no vocals, no lyrics, artisan pizzeria mood, Naples charm, uplifting but calm.';

  const resp = await fetch('https://api.elevenlabs.io/v1/music', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, music_length_ms: duration }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    return new Response(JSON.stringify({ error: t, status: resp.status }), { status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const buf = await resp.arrayBuffer();
  return new Response(buf, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' } });
});
