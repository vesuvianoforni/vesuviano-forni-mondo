import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { SearchInput, searchEngine, startApify, collectApify, enrichEngine, draftEngine, checked } from '../_shared/mario/engines.ts';
import { MARIO_VERSION, marioSystemPrompt, publicWebsite, canDraft, validateSequence } from '../_shared/mario/policy.ts';
import { STARTER_TEMPLATES, renderMarioEmail } from '../_shared/mario/templates.ts';
import { containsPrices } from '../_shared/marketing-policy.ts';
import { deliveryLimits } from '../_shared/mario/delivery-policy.ts';
import { enqueueMario, preflightMario, syncMarioInbox, dispatchMarioOnce } from '../_shared/mario/delivery.ts';
import { MARIO_COUNTRIES } from '../_shared/mario/markets.ts';
import { proposeResearch, researchPlans, approveResearch, cancelResearch } from '../_shared/mario/research.ts';

const Body = z.discriminatedUnion('action', [
  z.object({ action: z.literal('overview') }),
  z.object({ action: z.literal('research_plans'), thread_id: z.string().uuid() }),
  z.object({ action: z.literal('propose_research'), thread_id: z.string().uuid(), request: z.string().trim().min(5).max(4000) }),
  z.object({ action: z.literal('approve_research'), id: z.string().uuid() }),
  z.object({ action: z.literal('cancel_research'), id: z.string().uuid() }),
  z.object({ action: z.literal('prospect_messages'), id:z.string().uuid() }),
  z.object({ action: z.literal('search'), provider: z.enum(['firecrawl','apify']), ...SearchInput.shape }),
  z.object({ action: z.literal('collect'), id: z.string().uuid() }),
  z.object({ action: z.literal('enrich'), id: z.string().uuid() }),
  z.object({ action: z.literal('draft'), id: z.string().uuid() }),
  z.object({ action: z.literal('approve'), id: z.string().uuid() }),
  z.object({ action: z.literal('template_sequence'), id: z.string().uuid() }),
  z.object({ action: z.literal('queue_sequence'), id: z.string().uuid() }),
  z.object({ action: z.literal('sync_inbox') }),
  z.object({ action: z.literal('preflight') }),
  z.object({ action: z.literal('dispatch_once') }),
  z.object({ action: z.literal('save_settings'), daily_limit:z.number().int().min(1).max(200), min_interval_seconds:z.number().int().min(180).max(86400), window_start:z.number().int().min(0).max(23), window_end:z.number().int().min(1).max(24), timezone:z.enum(['Europe/Rome','Europe/London','Europe/Paris']) }),
  z.object({ action:z.literal('eligibility'),id:z.string().uuid(),recipient_eligibility:z.enum(['eligible','blocked','unreviewed']),eligibility_note:z.string().trim().min(10).max(2000) }),
  z.object({ action:z.literal('prospect_add'),name:z.string().trim().min(2).max(200),kind:z.enum(['pizzeria','partner']),country:z.enum(MARIO_COUNTRIES),city:z.string().max(80),website:z.string().max(1000),email:z.string().email().nullable(),phone:z.string().max(50).nullable(),contact_name:z.string().max(160).nullable() }),
  z.object({ action:z.literal('suppress'),id:z.string().uuid(),reason:z.string().trim().min(3).max(500) }),
  z.object({ action:z.literal('save_template'),key:z.string().max(80),subject:z.string().trim().min(3).max(100),body:z.string().trim().min(80).max(2500) }),
  z.object({ action: z.literal('instructions'), instructions: z.string().max(4000) }),
  z.object({ action: z.literal('knowledge'), id: z.string().uuid().nullable(), title: z.string().trim().min(2).max(160), content: z.string().trim().min(10).max(8000), source_url: z.string().max(1000).nullable(), active: z.boolean() }),
  z.object({ action: z.literal('pause') }), z.object({ action: z.literal('resume_ai') }),
  z.object({ action: z.literal('autopilot_save'), enabled: z.boolean(), daily_organization_goal: z.number().int().min(10).max(300) }),
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
      const [config, knowledge, runs, messages, settings, totals, templates, kpis, outbox, autopilot, effective] = await Promise.all([
        db.from('outreach_agent_config').select('*').eq('key','default').single(), db.from('outreach_knowledge').select('*').order('updated_at', { ascending: false }).limit(60),
        db.from('outreach_runs').select('id,kind,status,found,sent,error,created_at,result').order('created_at', { ascending: false }).limit(20),
        db.from('outreach_messages').select('id,prospect_id,step,subject,body,html,status,approved_at').order('created_at', { ascending: false }).limit(60),
        db.from('outreach_settings').select('paused,sender_email,pause_reason,daily_limit,min_interval_seconds,window_start,window_end,timezone,weekdays,provider_approval_reference,provider_verified_at,preflight').eq('key','default').single(), db.rpc('mario_prospect_summary'),
        db.from('outreach_templates').select('*').eq('active',true),db.rpc('mario_kpis'),db.from('outreach_outbox').select('id,prospect_id,subject,smtp_status,copy_status,attempted_at,accepted_at,last_error').order('created_at',{ascending:false}).limit(30),
        db.from('outreach_autopilot').select('enabled,countries,territory_cursor,daily_organization_goal,last_planned_on,last_tick_at,last_result').eq('key','default').single(), db.rpc('mario_effective_daily_limit'),
      ]);
      const saved=checked(templates);const library=STARTER_TEMPLATES.map(t=>({...t,...saved.find(s=>s.key===t.key),html:renderMarioEmail(saved.find(s=>s.key===t.key)?.body??t.body,t.language).html}));
      return json({ config: checked(config), knowledge: checked(knowledge), runs: checked(runs), messages: checked(messages), settings: checked(settings), totals: checked(totals), templates:library,kpis:checked(kpis),outbox:checked(outbox),autopilot:checked(autopilot),effective_daily_limit:effective.data??0,is_admin: isAdmin, system_prompt: marioSystemPrompt(checked(config).instructions), version: MARIO_VERSION });
    }
    if (b.action === 'research_plans') return json(await researchPlans(db, b.thread_id));
    if (b.action === 'propose_research') return json(await proposeResearch(db, req, auth.user.id, b.thread_id, b.request));
    if (b.action === 'approve_research') return json(await approveResearch(db, b.id, auth.user.id));
    if (b.action === 'cancel_research') return json(await cancelResearch(db, b.id));
    if (b.action === 'search') return json({ error: 'Chiedi a Mario un piano di ricerca e approvalo prima dell’avvio.' }, 409);
    if (b.action === 'prospect_messages') return json({ messages: checked(await db.from('outreach_messages').select('id,prospect_id,step,subject,body,html,status,approved_at').eq('prospect_id',b.id).order('step').limit(100)) });
    if (b.action === 'collect') return json(await collectApify(db, req, b.id));
    if (b.action === 'enrich') return json(await enrichEngine(db, req, auth.user.id, b.id));
    if (b.action === 'draft') return json(await draftEngine(db, req, auth.user.id, b.id));
    if (b.action==='template_sequence'){
      const p=checked(await db.from('outreach_prospects').select('*').eq('id',b.id).single());const block=canDraft(p);if(block)return json({error:block},409);
      const exclusions=checked(await db.from('outreach_suppressions').select('value').in('value',[p.email,p.domain].filter(Boolean)));if(exclusions.length)return json({error:'Destinatario escluso'},409);
      const exists=checked(await db.from('outreach_messages').select('id').eq('prospect_id',b.id).eq('direction','outbound').limit(1));if(exists.length)return json({error:'Sequenza già presente: non viene sovrascritta.'},409);
      const saved=checked(await db.from('outreach_templates').select('*').eq('active',true));const language=p.country==='FR'?'fr':'en';
      const ms=STARTER_TEMPLATES.filter(t=>t.kind===p.kind&&t.language===language).map(t=>({...t,...saved.find(s=>s.key===t.key)}));validateSequence(ms,containsPrices);
      checked(await db.from('outreach_messages').insert(ms.map(m=>{const rendered=renderMarioEmail(m.body,language);return {prospect_id:b.id,step:m.step,subject:m.subject,body:rendered.text,html:rendered.html,status:'draft',direction:'outbound',template_key:m.key,sources:{evidence:p.evidence,template_key:m.key}};})));
      return json({note:'Tre email HTML preparate dai modelli; revisione e approvazione richieste.'});
    }
    if(b.action==='prospect_add'){
      const site=publicWebsite(b.website);checked(await db.from('outreach_prospects').insert({name:b.name,kind:b.kind,country:b.country,city:b.city,website:site.url,domain:site.domain,email:b.email?.toLowerCase()??null,phone:b.phone,contact_name:b.contact_name,source:'manual',source_url:site.url,status:b.country==='DE'?'manual':'new',qualified:false,evidence:{source_url:site.url,added_by:auth.user.id}}));return json({note:'Contatto aggiunto all’archivio, da verificare.'});
    }
    if(b.action==='suppress'){
      const p=checked(await db.from('outreach_prospects').select('email,domain').eq('id',b.id).single());
      for(const value of [p.email,p.domain].filter(Boolean))checked(await db.from('outreach_suppressions').upsert({value,reason:b.reason}));
      checked(await db.from('outreach_prospects').update({status:'suppressed',recipient_eligibility:'blocked',next_send_at:null}).eq('id',b.id));return json({note:'Contatto escluso da qualsiasi prossimo invio.'});
    }
    if(b.action==='queue_sequence')return json(await enqueueMario(db,b.id));
    if(b.action==='sync_inbox')return json(await syncMarioInbox(db));
    if (b.action === 'approve') {
      const m = checked(await db.from('outreach_messages').select('id,status').eq('id',b.id).single());
      if (m.status !== 'draft') return json({ error: 'Bozza non approvabile' }, 409);
      checked(await db.from('outreach_messages').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: auth.user.id }).eq('id', b.id).eq('status', 'draft'));
      return json({ approved: true, note: 'Contenuto approvato, invii ancora in pausa.' });
    }
    if (b.action === 'pause') { checked(await db.from('outreach_settings').update({ paused:true,pause_reason:'Pausa manuale' }).eq('key','default')); return json({ paused:true }); }
    if (!isAdmin) return json({ error: 'Solo l’amministratore può modificare le istruzioni e le conoscenze.' }, 403);
    if(b.action==='autopilot_save'){checked(await db.from('outreach_autopilot').update({enabled:b.enabled,daily_organization_goal:b.daily_organization_goal,owner_id:auth.user.id}).eq('key','default').select('key'));return json({note:b.enabled?'Autopilota attivo: ricerca giornaliera e invii automatici entro i limiti.':'Autopilota disattivato.'});}
    if(b.action==='preflight')return json(await preflightMario(db));
    if(b.action==='dispatch_once')return json(await dispatchMarioOnce(db));
    if(b.action==='save_settings'){
      deliveryLimits(b.daily_limit,b.min_interval_seconds);if(b.window_start>=b.window_end)return json({error:'Finestra oraria non valida'},400);
      checked(await db.from('outreach_settings').update({daily_limit:b.daily_limit,min_interval_seconds:b.min_interval_seconds,window_start:b.window_start,window_end:b.window_end,timezone:b.timezone}).eq('key','default'));
      return json({note:'Impostazioni salvate; il limite include avvio e follow-up. '});
    }
    if(b.action==='eligibility'){
      const p=checked(await db.from('outreach_prospects').select('country,qualified,email').eq('id',b.id).single());if(b.recipient_eligibility==='eligible'&&(!p.qualified||!p.email||p.country==='DE'))return json({error:'Contatto non qualificato o mercato solo manuale.'},409);
      checked(await db.from('outreach_prospects').update({recipient_eligibility:b.recipient_eligibility,eligibility_note:b.eligibility_note,eligibility_checked_by:auth.user.id,eligibility_checked_at:new Date().toISOString()}).eq('id',b.id));return json({note:'Valutazione del destinatario registrata.'});
    }
    if(b.action==='save_template'){
      const t=STARTER_TEMPLATES.find(t=>t.key===b.key);if(!t)return json({error:'Modello non valido'},400);
      validateSequence([0,1,2].map(step=>({step,subject:b.subject,body:b.body})),containsPrices);
      checked(await db.from('outreach_templates').upsert({...t,subject:b.subject,body:b.body,updated_by:auth.user.id}));return json({note:'Modello salvato; le sequenze già approvate non cambiano.'});
    }
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