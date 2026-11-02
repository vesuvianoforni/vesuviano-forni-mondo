import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { checked } from '../_shared/mario/engines.ts';
import { executeResearchJob } from '../_shared/mario/research.ts';

const Body = z.object({ job_id: z.string().uuid(), token: z.string().uuid() }).strict();
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Metodo non consentito' }, 405);
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Richiesta non valida' }, 400);
    const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'Servizio non configurato' }, 503);
    const db = createClient(url, key);
    const { job_id, token } = parsed.data;
    const rows = checked(await db.rpc('claim_mario_research_job', { p_id: job_id, p_token: token }));
    if (!rows?.length) return json({ error: 'Operazione non autorizzata o già acquisita' }, 403);
    EdgeRuntime.waitUntil(executeResearchJob(db, rows[0]));
    return json({ accepted: true }, 202);
  } catch { return json({ error: 'Operazione non disponibile' }, 422); }
});