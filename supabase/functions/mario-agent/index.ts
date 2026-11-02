import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { SearchInput, searchEngine, startApify, collectApify, enrichEngine, draftEngine, checked } from '../_shared/mario/engines.ts';
import { MARIO_VERSION, marioSystemPrompt, publicWebsite } from '../_shared/mario/policy.ts';

const Body = z.discriminatedUnion('action', [
  z.object({ action: z.literal('overview') }),
  z.object({ action: z.literal('prospect_messages'), id:z.string().uuid() }),
  z.object({ action: z.literal('search'), provider: z.enum(['firecrawl','apify']), ...SearchInput.shape }),
  z.object({ action: z.literal('collect'), id: z.string().uuid() }),
  z.object({ action: z.literal('enrich'), id: z.string().uuid() }),
  z.object({ action: z.literal('draft'), id: z.string().uuid() }),
  z.object({ action: z.literal('approve'), id: z.string().uuid() }),
  z.object({ action: z.literal('instructions'), instructions: z.string().max(4000) }),
  z.object({ action: z.literal('knowledge'), id: z.string().uuid().nullable(), title: z.string().trim().min(2).max(160), content: z.string().trim().min(10).max(8000), source_url: z.string().max(1000).nullable(), active: z.boolean() }),
  z.object({ action: z.literal('pause') }), z.object({ action: z.literal('resume_ai') }),
]);
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Metodo non consentito' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'Servizio non configurato' }, 503);
    const db = createClient(url, key);
    const { data: auth } = await db.auth.getUser((req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, ''));
    if (!auth.user) return json({ error: 'Accesso richiesto' }, 401);
    const roles = checked(await db.from('user_roles').select('role').eq('user_id', auth.user.id));
    const isAdmin = roles.some(r => r.role === 'admin');
    if (!isAdmin && !roles.some(r => r.role === 'commerciale')) return json({ error: 'Accesso negato' }, 403);
    const parsed = Body.safeParse(await req.json()); if (!parsed.success) return json({ error: 'Richiesta non valida' }, 400);
    const b = parsed.data;
    if (b.action === 'overview') {
      const [config, knowledge, runs, messages, settings, totals] = await Promise.all([
        db.from('outreach_agent_config').select('*').eq('key','default').single(), db.from('outreach_knowledge').select('*').order('updated_at', { ascending: false }).limit(60),
        db.from('outreach_runs').select('id,kind,status,found,sent,error,created_at,result').order('created_at', { ascending: false }).limit(20),
        db.from('outreach_messages').select('id,prospect_id,step,subject,body,html,status,approved_at').order('created_at', { ascending: false }).limit(60),
        db.from('outreach_settings').select('paused,sender_email,pause_reason').eq('key','default').single(), db.rpc('mario_prospect_summary'),
      ]);
      return json({ config: checked(config), knowledge: checked(knowledge), runs: checked(runs), messages: checked(messages), settings: checked(settings), totals: checked(totals), is_admin: isAdmin, system_prompt: marioSystemPrompt(checked(config).instructions), version: MARIO_VERSION });
    }
    if (b.action === 'search') return json(b.provider === 'firecrawl' ? await searchEngine(db, req, auth.user.id, b) : await startApify(db, req, auth.user.id, b));
    if (b.action === 'prospect_messages') return json({ messages: checked(await db.from('outreach_messages').select('id,prospect_id,step,subject,body,html,status,approved_at').eq('prospect_id',b.id).order('step').limit(100)) });
    if (b.action === 'collect') return json(await collectApify(db, req, b.id));
    if (b.action === 'enrich') return json(await enrichEngine(db, req, auth.user.id, b.id));
    if (b.action === 'draft') return json(await draftEngine(db, req, auth.user.id, b.id));
    if (b.action === 'approve') {
      const m = checked(await db.from('outreach_messages').select('id,status').eq('id',b.id).single());
      if (m.status !== 'draft') return json({ error: 'Bozza non approvabile' }, 409);
      checked(await db.from('outreach_messages').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: auth.user.id }).eq('id', b.id).eq('status', 'draft'));
      return json({ approved: true, note: 'Contenuto approvato, invii ancora in pausa.' });
    }
    if (b.action === 'pause') { checked(await db.from('outreach_settings').update({ paused:true,pause_reason:'Pausa manuale' }).eq('key','default')); return json({ paused:true }); }
    if (!isAdmin) return json({ error: 'Solo l’amministratore può modificare le istruzioni e le conoscenze.' }, 403);
    if (b.action === 'instructions') checked(await db.from('outreach_agent_config').update({ instructions:b.instructions }).eq('key','default'));
    if (b.action === 'resume_ai') checked(await db.from('outreach_agent_config').update({ ai_status:null,ai_reason:null }).eq('key','default'));
    if (b.action === 'knowledge') {
      if (b.source_url) publicWebsite(b.source_url);
      const fields = { title:b.title,content:b.content,source_url:b.source_url,active:b.active,updated_by:auth.user.id };
      checked(b.id ? await db.from('outreach_knowledge').update(fields).eq('id',b.id) : await db.from('outreach_knowledge').insert(fields));
    }
    return json({ saved:true });
  } catch (e) {
    if ((e as Error).name === 'AbortError') return new Response(null,{status:499,headers:corsHeaders});
    const err = e as {status?:number;message?:string;details?:string};
    console.error('Mario operation failed',err.status ?? 422);
    return json({ error:err.message ?? 'Operazione non riuscita', ...(err.details ? { details:err.details } : {}) },err.status ?? 422);
  }
});