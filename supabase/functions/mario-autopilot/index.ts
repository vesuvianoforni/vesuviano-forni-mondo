import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { runAutopilot } from '../_shared/mario/autopilot.ts';

// Scheduled tick: accepts no input. Every step is idempotent, leased and gated by DB state,
// so an extra call can at most run the same once-per-day planning and one spaced delivery attempt.
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return new Response(JSON.stringify({ error: 'Servizio non configurato' }), { status: 503, headers: corsHeaders });
  try {
    const out = await runAutopilot(createClient(url, key));
    return new Response(JSON.stringify(out), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Mario autopilot failed', (e as Error).message);
    return new Response(JSON.stringify({ error: 'Autopilota non completato' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
