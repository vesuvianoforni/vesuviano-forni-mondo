import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { checked } from '../_shared/mario/engines.ts';
import { executeResearchJob } from '../_shared/mario/research.ts';

const Body = z.object({ job_id: z.string().uuid(), token: z.string().uuid(), action: z.literal('apify_complete').optional() }).strict();
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
    const { job_id, token, action } = parsed.data;
    // A delayed hop carries only this persisted job's capability; it cannot expand the approved queue.
    const job=checked(await db.from('outreach_research_jobs').select('not_before').eq('id',job_id).eq('worker_token',token).eq('status',action?'running':'queued').maybeSingle());
    const delay=action?0:Math.min(10000,Math.max(0,Date.parse(job.not_before)-Date.now()));
    if(delay>0){
      EdgeRuntime.waitUntil((async()=>{await new Promise(resolve=>setTimeout(resolve,delay));const rows=checked(await db.rpc('claim_mario_research_job',{p_id:job_id,p_token:token}));if(rows.length)await executeResearchJob(db,rows[0]);})());
      return json({accepted:true},202);
    }
    const rows = checked(await db.rpc(action ? 'claim_mario_research_callback' : 'claim_mario_research_job', { p_id: job_id, p_token: token }));
    if (!rows?.length) return json({ error: 'Operazione non autorizzata o già acquisita' }, 403);
    EdgeRuntime.waitUntil(executeResearchJob(db, rows[0], Boolean(action)));
    return json({ accepted: true }, 202);
  } catch { return json({ error: 'Operazione non disponibile' }, 422); }
});