import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { assistantConfig, callAllowed, timezoneFromPhone, e164, FROM_NUMBER, nextCallStatus, callOutcomeCode, Proposal, PlanProposal, planNextStep, isHoursBlock, AnyToolRequest, verifyTelnyx, voiceTools, inboundLanguage, INBOUND_HANDOVER_POLICY, InboundVariables, inboundAssistantConfig, inboundExtraTools, inboundRoutingTexml, DEFAULT_TRANSFER_NUMBER } from './domain.ts';
import { AnalyzedEvent, analyzedMatches, RecordingCallback, spokenTranscript } from './results-domain.ts';
import { processResults, queueResults } from './results.ts';
import { receiveForwardedCall, updateForwardedCall } from './inbound-history.ts';

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
const Request = z.discriminatedUnion('action', [
  z.object({ action: z.literal('status'), view: z.enum(['planned','executed']).optional(), before_at: z.string().datetime({offset:true}).optional(), before_id: z.string().uuid().optional() }).strict(),
  z.object({ action: z.literal('detail'), call_id: z.string().uuid() }).strict(),
  z.object({ action: z.literal('configure') }).strict(),
  Proposal.extend({ action: z.literal('propose') }).strict(),
  z.object({ action: z.literal('approve'), call_id: z.string().uuid() }).strict(),
  z.object({ action: z.literal('cancel'), call_id: z.string().uuid() }).strict(),
  z.object({ action: z.literal('live'), call_id: z.string().uuid() }).strict(),
  z.object({ action: z.literal('hangup'), call_id: z.string().uuid() }).strict(),
  PlanProposal.extend({ action: z.literal('plan_propose') }).strict(),
  z.object({ action: z.enum(['plan_detail','plan_approve','plan_pause','plan_resume','plan_cancel']), plan_id: z.string().uuid() }).strict(),
]);
class ProviderError extends Error {
  constructor(public status: number, public details: string) { super(`Telnyx [${status}]: ${details}`); }
}
async function telnyx(path: string, method = 'GET', body?: unknown) {
  const key = Deno.env.get('LOVABLE_API_KEY'), connection = Deno.env.get('UDC_TELNYX_API_KEY');
  if (!key || !connection) throw new Error('Collegamento Telnyx non configurato');
  const res = await fetch(`https://connector-gateway.lovable.dev/udc_telnyx${path}`, {
    method, headers: { Authorization: `Bearer ${key}`, 'X-Connection-Api-Key': connection, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) {
    const details = await res.text();
    // Keep credentials out of all output. Provider request bodies are never logged.
    const safe = details.replaceAll(key, '[redacted]').replaceAll(connection, '[redacted]');
    console.error('Telnyx request failed', res.status, safe);
    throw new ProviderError(res.status, safe);
  }
  return await res.json();
}
function checked<T>(r: { data: T; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}

// deno-lint-ignore no-explicit-any
async function dial(admin: any, settings: any, url: string, call: any, lead: any, approverId: string) {
    const claimed = checked(await admin.from('bruno_voice_calls').update({ status: 'starting', approved_by: approverId, approved_at: new Date().toISOString(), started_at: new Date().toISOString() }).eq('id', call.id).eq('status', 'proposed').select('id').maybeSingle());
  if (!claimed) return { error: 'Chiamata già approvata', status: 409 };
  try {
    const recent: any[] = checked(await admin.from('crm_messages').select('channel,direction,body,created_at').eq('lead_id', lead.id).order('created_at', { ascending: false }).limit(8)) ?? [];
    const callback = `${url}/functions/v1/bruno-voice?callback=1&call_id=${call.id}`;
    const result = await telnyx(`/texml/ai_calls/${settings.application_id}`, 'POST', {
      From: FROM_NUMBER, To: call.destination, AIAssistantId: settings.assistant_id,
      AIAssistantDynamicVariables: { vesuviano_call_id: call.id, call_objective: call.objective, call_type: call.call_type, call_instructions: call.instructions || 'none', customer_context: JSON.stringify({ ...lead, messages: recent.map((m: any) => ({ ...m, body: m.body.slice(0, 800) })) }) },
      StatusCallback: callback, StatusCallbackMethod: 'POST', StatusCallbackEvent: 'initiated ringing answered completed no-answer busy canceled failed analyzed',
      Record: true, RecordingChannels: 'dual', RecordingTrack: 'both', SendRecordingUrl: true,
      RecordingStatusCallback: `${url}/functions/v1/bruno-voice?recording=1&call_id=${call.id}`, RecordingStatusCallbackMethod: 'POST', RecordingStatusCallbackEvent: 'completed absent',
      TimeLimit: 600, Timeout: 30,
    });
    const providerId = result.call_sid ?? result.data?.call_sid;
    checked(await admin.from('bruno_voice_calls').update({ status: providerId ? 'dialing' : 'unknown', provider_call_id: providerId ?? null }).eq('id', call.id).eq('status', 'starting'));
    return { call_id: call.id, status: providerId ? 'dialing' : 'unknown', from_number: FROM_NUMBER, language: 'en' };
  } catch (error) {
    // Never automatically retry a submission that may already have reached the carrier.
    checked(await admin.from('bruno_voice_calls').update({ status: error instanceof ProviderError && error.status < 500 ? 'failed' : 'unknown', error_code: error instanceof ProviderError ? `telnyx_${error.status}` : 'submission_uncertain' }).eq('id', call.id).eq('status', 'starting'));
    throw error;
  }
}

// deno-lint-ignore no-explicit-any
async function planTick(admin: any, settings: any, url: string, planId: string, token: string) {
  const plan: any = (checked(await admin.rpc('claim_bruno_call_plan', { p_id: planId, p_token: token })) as any[] | null)?.[0];
  if (!plan) return { ignored: true };
  const release = (fields: Record<string, unknown> = {}) => admin.from('bruno_call_plans').update({ lease_until: null, ...fields }).eq('id', planId);
  try {
    const calls: any[] = checked(await admin.from('bruno_voice_calls').select('*').eq('plan_id', planId)) ?? [];
    // An uncertain submission is never repeated: stop the plan for a human check.
    if (calls.some((c: any) => c.status === 'unknown')) { await release({ status: 'paused', last_error: 'Esito di una chiamata incerto: piano in pausa, verifica prima di riprendere.' }); return { paused: true }; }
    const step = planNextStep(calls, plan.gap_minutes);
    if (step.kind === 'done') { await release({ status: 'completed', last_error: null }); return { completed: true }; }
    if (step.kind === 'wait') { await release(); return { waiting: true }; }
    if (!settings.assistant_id || !settings.application_id || !settings.public_key) { await release({ last_error: 'Assistente telefonico non configurato' }); return { waiting: true }; }
    // Follow plan order, but if a customer is outside 9-20 local time, call the next one whose local time allows it.
    const ordered = [calls.find((c: any) => c.id === (step as { call_id: string }).call_id), ...calls.filter((c: any) => c.status === 'proposed' && c.id !== (step as { call_id: string }).call_id).sort((a: any, b: any) => a.plan_position - b.plan_position)];
    const call = ordered.find((c: any) => !isHoursBlock(callAllowed({}, c.customer_timezone, new Date(), 'operator')));
    if (!call) { await release({ last_error: null }); return { waiting: true, hours: true }; }
    const lead: any = checked(await admin.from('leads').select('id,contact_name,company_name,phone,city,country,status,archived,qualification,bruno_mode,bruno_paused_until').eq('id', call.lead_id).single());
    let phone: string | null = null; try { phone = e164(lead?.phone || ''); } catch { /* invalid */ }
    const blocked = !lead ? 'Cliente non trovato' : phone !== call.destination ? 'Telefono modificato' : callAllowed(lead, call.customer_timezone, new Date(), 'operator');
    if (blocked) { checked(await admin.from('bruno_voice_calls').update({ status: 'cancelled', error_code: 'plan_skipped' }).eq('id', call.id).eq('status', 'proposed')); await release({ last_error: `${lead?.contact_name || 'Cliente'}: ${blocked}` }); return { skipped: call.id }; }
    try { await dial(admin, settings, url, call, lead, plan.approved_by); } catch { /* dial() already stored failed/unknown */ }
    await release({ last_error: null });
    return { dialed: call.id };
  } catch (e) { await release({ last_error: e instanceof Error ? e.message.slice(0, 300) : 'Errore piano' }); return { error: true }; }
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const url = Deno.env.get('SUPABASE_URL'), key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return json({ error: 'Servizio chiamate non configurato' }, 503);
  const admin = createClient(url, key);
  const address = new URL(req.url);
  try {
    const xml = (body: string) => new Response(body, { headers: { ...corsHeaders, 'Content-Type': 'application/xml' } });
    if (address.searchParams.has('texml')) {
      // Keep the existing public TeXML routing fail-open; only signed provider requests can write history.
      const s = checked(await admin.from('bruno_voice_settings').select('inbound_mode,inbound_forward_number,inbound_assistant_id,public_key').eq('key', 'default').single());
      let historyId: string | null = null;
      if (req.method === 'POST' && s.inbound_mode === 'forward') {
        const body = await req.text();
        if (body.length <= 512000 && s.public_key && await verifyTelnyx(body, req.headers.get('telnyx-signature-ed25519'), req.headers.get('telnyx-timestamp'), s.public_key)) {
          try {
            const data = req.headers.get('content-type')?.includes('application/json') ? JSON.parse(body) : Object.fromEntries(new URLSearchParams(body));
            historyId = await receiveForwardedCall(admin, data, s.inbound_forward_number || DEFAULT_TRANSFER_NUMBER);
          } catch { console.error('bruno-voice', 'inbound_history_unavailable'); }
        }
      }
      return xml(inboundRoutingTexml(s, url, historyId));
    }
    if (req.method !== 'POST') return json({ error: 'Metodo non consentito' }, 405);
    const raw = await req.text();
    if (raw.length > 512000) return json({ error: 'Richiesta troppo grande' }, 413);
    const settings = checked(await admin.from('bruno_voice_settings').select('*').eq('key', 'default').single());
    const signed = async () => !!settings.public_key && await verifyTelnyx(raw, req.headers.get('telnyx-signature-ed25519'), req.headers.get('telnyx-timestamp'), settings.public_key);

    if (address.searchParams.has('forward_status')) {
      if (!await signed()) return json({ error: 'Firma Telnyx non valida' }, 401);
      const id = z.string().uuid().safeParse(address.searchParams.get('id'));
      if (!id.success) return json({ error: 'Riferimento chiamata non valido' }, 400);
      const data = req.headers.get('content-type')?.includes('application/json') ? JSON.parse(raw) : Object.fromEntries(new URLSearchParams(raw));
      const result = await updateForwardedCall(admin, data, id.data, address.searchParams.has('end'));
      return address.searchParams.has('end') ? xml('<Response><Hangup/></Response>') : json(result);
    }

    if (address.searchParams.has('vars')) {
      // Signed assistant initialization for an inbound call: bind the caller to a CRM lead and a call record.
      if (!await signed()) return json({ error: 'Firma Telnyx non valida' }, 401);
      const parsed = InboundVariables.safeParse(JSON.parse(raw));
      if (!parsed.success) return json({ dynamic_variables: {} });
      const p = parsed.data.data.payload;
      if (!settings.inbound_assistant_id || p.assistant_id !== settings.inbound_assistant_id || (p.telnyx_agent_target && p.telnyx_agent_target !== FROM_NUMBER)) return json({ error: 'Assistente non riconosciuto' }, 403);
      let caller: string; try { caller = e164(p.telnyx_end_user_target); } catch { caller = p.telnyx_end_user_target.replace(/[^+\d]/g, '').slice(0, 20) || 'unknown'; }
      const lang = inboundLanguage(caller), zone = timezoneFromPhone(caller) ?? 'Europe/London';
      let call: any = checked(await admin.from('bruno_voice_calls').select('id,lead_id').eq('direction', 'inbound').eq('provider_call_id', p.call_control_id).maybeSingle());
      let lead: any = null;
      if (call) lead = checked(await admin.from('leads').select('id,contact_name,company_name,city,country,status,qualification').eq('id', call.lead_id).maybeSingle());
      if (!call) {
        const digits = caller.replace(/\D/g, '').slice(-9);
        const candidates: any[] = digits.length >= 7 ? checked(await admin.from('leads').select('id,contact_name,company_name,city,country,status,qualification,phone,archived,updated_at').ilike('phone', `%${digits.slice(-7)}%`).order('updated_at', { ascending: false }).limit(20)) ?? [] : [];
        const same = (v: string | null) => { const d = (v || '').replace(/\D/g, ''); return d.length >= 7 && d.slice(-9) === digits; };
        lead = candidates.find(l => same(l.phone) && !l.archived) ?? candidates.find(l => same(l.phone)) ?? null;
        if (!lead) lead = checked(await admin.from('leads').insert({ contact_name: `Chiamata in entrata ${caller}`, phone: caller, source: 'telefono_bruno', notes: 'Lead creato da una chiamata in entrata gestita da Bruno.' }).select('id,contact_name,company_name,city,country,status,qualification').single());
        const now = new Date().toISOString();
        const inserted = await admin.from('bruno_voice_calls').insert({ lead_id: lead.id, direction: 'inbound', destination: caller, language: lang.code, objective: 'Chiamata in entrata: rispondere, qualificare e, se serve, passare a Gennaro.', call_type: 'qualifica', customer_timezone: zone, status: 'active', approved_at: now, started_at: now, expires_at: now, provider_call_id: p.call_control_id }).select('id,lead_id').single();
        call = inserted.error ? checked(await admin.from('bruno_voice_calls').select('id,lead_id').eq('direction', 'inbound').eq('provider_call_id', p.call_control_id).single()) : inserted.data;
      }
      const known = lead && !String(lead.contact_name || '').startsWith('Chiamata in entrata');
      const rome = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', dateStyle: 'full', timeStyle: 'short' }).format(new Date());
      return json({ dynamic_variables: {
        vesuviano_call_id: call.id, call_language: lang.name, inbound_greeting: lang.greeting, caller_timezone: zone, rome_time: rome,
        handover_policy: INBOUND_HANDOVER_POLICY,
        customer_context: JSON.stringify(known ? { existing_customer: true, name: lead.contact_name, company: lead.company_name, city: lead.city, country: lead.country, crm_stage: lead.status, qualification: lead.qualification } : { existing_customer: false, phone_prefix: caller.slice(0, 4) }).slice(0, 3000),
      } });
    }

    if (!address.searchParams.has('tool') && !address.searchParams.has('callback') && !address.searchParams.has('recording') && req.headers.get('content-type')?.includes('application/json')) {
      const job = z.object({ action: z.literal('result_job'), call_id: z.string().uuid(), token: z.string().uuid() }).strict().safeParse(JSON.parse(raw));
      if (job.success) {
        const dir = checked(await admin.from('bruno_voice_calls').select('direction').eq('id', job.data.call_id).maybeSingle());
        return json(await processResults(admin, job.data.call_id, job.data.token, (dir?.direction === 'inbound' ? settings.inbound_assistant_id : settings.assistant_id) || '', telnyx));
      }
      const tick = z.object({ action: z.literal('plan_tick'), plan_id: z.string().uuid(), token: z.string().uuid() }).strict().safeParse(JSON.parse(raw));
      if (tick.success) return json(await planTick(admin, settings, url, tick.data.plan_id, tick.data.token));
    }
    if (address.searchParams.has('inbound_end')) {
      // The inbound assistant ended (not a transfer): close the record and hang up.
      if (await signed()) {
        const sid = new URLSearchParams(raw).get('CallSid');
        const call: any = sid ? checked(await admin.from('bruno_voice_calls').select('id,status,ended_at').eq('direction', 'inbound').eq('provider_call_id', sid).maybeSingle()) : null;
        if (call && call.status === 'active') { checked(await admin.from('bruno_voice_calls').update({ status: 'completed', ended_at: call.ended_at ?? new Date().toISOString() }).eq('id', call.id).eq('status', 'active')); await queueResults(admin, call.id); }
      }
      return xml('<Response><Hangup/></Response>');
    }
    if (address.searchParams.has('tool') || address.searchParams.has('callback') || address.searchParams.has('recording')) {
      if (!await signed()) return json({ error: 'Firma Telnyx non valida' }, 401);
      if (address.searchParams.has('callback') || address.searchParams.has('recording')) {
        const data = req.headers.get('content-type')?.includes('application/json') ? JSON.parse(raw) : Object.fromEntries(new URLSearchParams(raw));
        let call: any;
        if (address.searchParams.has('inbound')) {
          // Inbound callbacks carry no call_id: bind them through the provider call id stored at answer time.
          const sid = typeof data.CallSid === 'string' ? data.CallSid : '';
          if (!sid) return json({ ok: true, ignored: true });
          const forwarded = checked(await admin.from('crm_inbound_calls').select('id').eq('provider_call_id', sid).maybeSingle());
          if (forwarded) return json(await updateForwardedCall(admin, data));
          call = checked(await admin.from('bruno_voice_calls').select('*').eq('direction', 'inbound').eq('provider_call_id', sid).maybeSingle());
          if (!call) return json({ ok: true, ignored: true });
        } else {
          const callId = z.string().uuid().safeParse(address.searchParams.get('call_id'));
          if (!callId.success) return json({ error: 'Riferimento chiamata non valido' }, 400);
          call = checked(await admin.from('bruno_voice_calls').select('*').eq('id', callId.data).maybeSingle());
        }
        if (!call?.approved_at) return json({ error: 'Chiamata non riconosciuta' }, 403);
        const analyzed = AnalyzedEvent.safeParse(data);
        if (analyzed.success) {
          if (!analyzedMatches(analyzed.data,call,(call.direction === 'inbound' ? settings.inbound_assistant_id : settings.assistant_id) || '')) return json({ error: 'Conversazione non riconosciuta' },403);
          const payload = analyzed.data.data.payload;
          checked(await admin.from('bruno_voice_calls').update({ conversation_id: payload.conversation_id, ...(payload.duration_sec != null ? { duration_seconds: payload.duration_sec } : {}) }).eq('id',call.id));
          await queueResults(admin,call.id,payload.recordings?.[0]?.download_urls.mp3 || payload.recordings?.[0]?.download_urls.wav);
          return json({ ok: true });
        }
        const recording = RecordingCallback.safeParse(data);
        if (recording.success) {
          if (!call.provider_call_id || call.provider_call_id !== recording.data.CallSid) return json({error:'Registrazione non riconosciuta'},403);
          if (recording.data.RecordingStatus === 'absent') checked(await admin.from('bruno_voice_calls').update({recording_status:'unavailable'}).eq('id',call.id).is('recording_path',null));
          if (recording.data.RecordingStatus === 'completed') {
            if (recording.data.RecordingDuration != null) checked(await admin.from('bruno_voice_calls').update({duration_seconds:recording.data.RecordingDuration}).eq('id',call.id));
            await queueResults(admin,call.id,recording.data.RecordingUrl);
          }
          return json({ok:true});
        }
        const parsed = z.object({ CallSid: z.string().min(1).max(500), CallStatus: z.string().max(50) }).passthrough().safeParse(data);
        if (!parsed.success) return json({ ok: true, ignored: true });
        if (!call?.approved_at || (call.provider_call_id && call.provider_call_id !== parsed.data.CallSid)) return json({ error: 'Chiamata non riconosciuta' }, 403);
        const status = nextCallStatus(call.status, parsed.data.CallStatus);
        const callDuration = Number((parsed.data as Record<string, unknown>).CallDuration);
        const outcome = status !== call.status ? callOutcomeCode(parsed.data.CallStatus, Number.isFinite(callDuration) ? callDuration : call.duration_seconds) : null;
        checked(await admin.from('bruno_voice_calls').update({ status, provider_call_id: parsed.data.CallSid,
          ...(outcome && !call.error_code ? { error_code: outcome } : {}),
          ...(Number.isFinite(callDuration) && call.duration_seconds == null ? { duration_seconds: callDuration } : {}),
          ...(['completed','failed','cancelled'].includes(status) && !call.ended_at ? { ended_at: new Date().toISOString() } : {}),
        }).eq('id', call.id).eq('status', call.status));
        if (['completed','failed','cancelled'].includes(status)) await queueResults(admin,call.id);
        return json({ ok: true });
      }
      const parsed = AnyToolRequest.safeParse(JSON.parse(raw));
      if (!parsed.success) return json({ error: 'Strumento non valido' }, 400);
      const input = parsed.data;
      const call = checked(await admin.from('bruno_voice_calls').select('*').eq('id', input.call_id).maybeSingle());
      // Bound every tool to a real approved call and a short post-call wrap-up window.
      if (!call?.approved_at || !['starting','dialing','active','completed'].includes(call.status) || !call.started_at || Date.now() - new Date(call.started_at).getTime() > 15 * 60000) return json({ error: 'Nessuna chiamata approvata attiva' }, 403);
      const lead = checked(await admin.from('leads').select('id,status,qualification').eq('id', call.lead_id).single());
      if (input.action === 'callback') {
        if (call.direction !== 'inbound') return json({ error: 'Solo per chiamate in entrata' }, 403);
        checked(await admin.rpc('save_bruno_voice_callback', { p_call: call.id, p_when: input.when, p_notes: input.notes }));
        return json({ saved: true, next_step: 'Callback recorded in the CRM for Gennaro. Tell the caller Gennaro will call back; do not promise anything else.' });
      }
      if (input.action === 'knowledge') {
        const rows = checked(await admin.from('bruno_knowledge').select('category,title,content,stages').eq('is_active', true).order('sort_order').limit(100));
        if (!lead) return json({ error: 'Cliente non trovato' }, 404);
        const eligible = (rows ?? []).filter(row => !row.stages?.length || row.stages.includes(lead.status));
        const words = input.query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const ranked = eligible.map(row => ({ ...row, score: words.filter(w => `${row.category} ${row.title} ${row.content}`.toLowerCase().includes(w)).length })).sort((a,b) => b.score-a.score);
        return json({ facts: ranked.slice(0, 25), instruction: 'Use only verified facts. A missing fact must be checked by the team; translate Italian facts to English. Prices are not authorized by this lookup.' });
      }
      if (input.action === 'products') {
        const query = input.query.replace(/[%_,()*]/g, ' ').trim().slice(0, 80);
        let request = admin.from('products').select('id,name,category,description,size_label,coating,component').eq('is_active', true).order('sort_order').limit(30);
        if (query) request = request.ilike('name', `%${query}%`);
        const products = checked(await request) ?? [];
        const assets = (products.length ? checked(await admin.from('product_assets').select('product_id,kind,title,language,description').eq('is_active', true).in('product_id', products.map(p => p.id)).limit(100)) : []) ?? [];
        return json({ products, materials: assets.filter(a => !a.language || a.language === 'en'), instruction: 'These are catalog records and material metadata, not parsed PDF contents. No prices/costs. Never infer unknown technical specifications or claim an attachment was sent.' });
      }
      // Atomic fact merge avoids losing progressive tool updates or manual CRM changes.
      checked(await admin.rpc('save_bruno_voice_qualification', { p_call: call.id, p_summary: input.summary, p_facts: input.qualification }));
      return json({ saved: true, next_step: 'Recorded for staff review. No offer, appointment or message was sent.' });
    }

    const auth = req.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) return json({ error: 'Non autenticato' }, 401);
    const { data: user, error } = await admin.auth.getUser(auth.slice(7));
    if (error || !user.user) return json({ error: 'Non autenticato' }, 401);
    const roles = checked(await admin.from('user_roles').select('role').eq('user_id', user.user.id)) ?? [];
    if (!roles.some(r => r.role === 'admin' || r.role === 'commerciale')) return json({ error: 'Accesso negato' }, 403);
    const parsed = Request.safeParse(JSON.parse(raw));
    if (!parsed.success) return json({ error: 'Richiesta non valida', details: parsed.error.flatten().fieldErrors }, 400);
    const input = parsed.data;
    if (input.action === 'status') {
      let query = admin.from('bruno_voice_calls').select('id,lead_id,direction,destination,language,call_type,objective,status,summary,error_code,created_at,started_at,ended_at,expires_at,duration_seconds,recording_status,transcript_status,summary_status,leads(contact_name,company_name)').order('created_at', { ascending: false }).order('id',{ascending:false}).limit(31);
      if (input.view === 'planned') query = query.in('status',['proposed','starting','dialing','active']);
      if (input.view === 'executed') query = query.in('status',['completed','failed','unknown','cancelled']);
      if (input.before_at && input.before_id) query = query.or(`created_at.lt.${input.before_at},and(created_at.eq.${input.before_at},id.lt.${input.before_id})`);
      const calls = checked(await query) ?? [];
      return json({ configured: Boolean(settings.assistant_id && settings.application_id && settings.public_key), inbound_configured: Boolean(settings.inbound_assistant_id), inbound_mode: settings.inbound_mode, inbound_forward_number: settings.inbound_mode === 'forward' ? settings.inbound_forward_number : null, from_number: FROM_NUMBER, language: 'en', calls: calls.slice(0,30), has_more: calls.length > 30 });
    }
    if (input.action === 'detail') {
      const call = checked(await admin.from('bruno_voice_calls').select('id,lead_id,direction,destination,call_type,objective,instructions,status,summary,transcript,created_at,started_at,ended_at,expires_at,duration_seconds,recording_path,recording_status,transcript_status,summary_status,leads(contact_name,company_name)').eq('id',input.call_id).single());
      if (!call) return json({error:'Chiamata non trovata'},404);
      const recording = call.recording_path ? checked(await admin.storage.from('bruno-call-recordings').createSignedUrl(call.recording_path,3600)) : null;
      const {recording_path: _path, ...safeCall} = call;
      return json({call:{...safeCall,recording_url:recording?.signedUrl ?? null}});
    }
    if (input.action === 'live' || input.action === 'hangup') {
      const call = checked(await admin.from('bruno_voice_calls').select('id,status,direction,provider_call_id,conversation_id,transcript').eq('id',input.call_id).single());
      if (!call) return json({error:'Chiamata non trovata'},404);
      const live = ['dialing','active'].includes(call.status);
      if (input.action === 'hangup') {
        if (!live || !call.provider_call_id) return json({ error: 'La chiamata non è in corso' }, 409);
        await telnyx(`/calls/${encodeURIComponent(call.provider_call_id)}/actions/hangup`, 'POST', {});
        return json({ ok: true });
      }
      if (!live || !call.provider_call_id) return json({ status: call.status, live: false, transcript: call.transcript ?? [] });
      let conversationId = call.conversation_id;
      try {
        const liveAssistant = call.direction === 'inbound' ? settings.inbound_assistant_id : settings.assistant_id;
        if (!conversationId && liveAssistant) {
          const q = new URLSearchParams({ 'metadata->call_control_id': `eq.${call.provider_call_id}`, 'metadata->assistant_id': `eq.${liveAssistant}`, limit: '2' });
          const found = await telnyx(`/ai/conversations?${q}`);
          if (found.data?.length === 1) conversationId = found.data[0].id;
        }
        if (!conversationId) return json({ status: call.status, live: true, transcript: [] });
        const messages: unknown[] = [];
        for (let page = 1; page <= 20; page++) {
          const result = await telnyx(`/ai/conversations/${encodeURIComponent(conversationId)}/messages?page%5Bsize%5D=100&page%5Bnumber%5D=${page}`);
          messages.push(...(result.data ?? []));
          if (!result.data?.length || page >= (result.meta?.total_pages ?? 1)) break;
        }
        const transcript = spokenTranscript(messages).sort((a,b) => (a.at ?? '').localeCompare(b.at ?? ''));
        return json({ status: call.status, live: true, transcript });
      } catch { return json({ status: call.status, live: true, transcript: [], pending: true }); }
    }
    if (input.action === 'configure') {
      if (!roles.some(r => r.role === 'admin')) return json({ error: 'Solo amministratore' }, 403);
      const publicKey = (await telnyx('/public_key')).data?.public;
      if (typeof publicKey !== 'string') return json({ error: 'Chiave pubblica Telnyx non disponibile' }, 503);
      checked(await admin.from('bruno_voice_settings').update({ public_key: publicKey }).eq('key', 'default'));
      const owned = (await telnyx(`/phone_numbers?filter%5Bphone_number%5D=${encodeURIComponent(FROM_NUMBER)}`)).data?.find((n: { phone_number: string }) => n.phone_number === FROM_NUMBER);
      if (!owned || owned.status !== 'active') return json({ error: 'Numero UK non attivo' }, 409);
      let applicationId = settings.application_id;
      if (!applicationId) {
        const connection = (await telnyx(`/connections/${owned.connection_id}`)).data;
        if (!connection?.outbound_voice_profile_id) return json({ error: 'Profilo outbound Telnyx mancante' }, 409);
        const app = await telnyx('/texml_applications', 'POST', { friendly_name: 'Bruno Vesuviano UK', voice_url: `${url}/functions/v1/bruno-voice?texml=1`, outbound: { outbound_voice_profile_id: connection.outbound_voice_profile_id } });
        applicationId = app.data?.id;
        if (!applicationId) throw new Error('Applicazione Telnyx non creata');
        checked(await admin.from('bruno_voice_settings').update({ application_id: applicationId }).eq('key', 'default'));
      }
      const library = (await telnyx('/ai/tools')).data ?? [];
      const ids: string[] = [];
      for (const definition of voiceTools(url)) {
        const existing = library.find((t: { display_name: string; id: string }) => t.display_name === definition.display_name);
        const created = existing ? null : await telnyx('/ai/tools', 'POST', definition);
        const result = existing ?? created?.data ?? created;
        if (!result?.id) throw new Error('Strumento Telnyx non creato');
        ids.push(result.id);
      }
      // Keep tools added directly in the Telnyx portal (e.g. knowledge-base retrieval buckets).
      if (settings.assistant_id) {
        const current = await telnyx(`/ai/assistants/${settings.assistant_id}`);
        for (const t of (current.data ?? current)?.tools ?? []) if (t.tool_id && t.type !== 'webhook' && t.type !== 'hangup' && t.type !== 'transfer' && library.some((l: any) => l.id === t.tool_id) && !ids.includes(t.tool_id)) ids.push(t.tool_id);
      }
      const config = assistantConfig(ids);
      const assistant = settings.assistant_id ? await telnyx(`/ai/assistants/${settings.assistant_id}`, 'POST', config) : await telnyx('/ai/assistants', 'POST', config);
      const assistantId = assistant.data?.id ?? assistant.id;
      if (!assistantId) throw new Error('Assistente Telnyx non creato');
      checked(await admin.from('bruno_voice_settings').update({ assistant_id: assistantId, configured_at: new Date().toISOString() }).eq('key', 'default'));
      // Inbound (explicitly requested by the owner): separate assistant with handover to Gennaro, then route the UK number to the TeXML app.
      const extra: string[] = [];
      const transferNumber = settings.transfer_number || DEFAULT_TRANSFER_NUMBER;
      for (const definition of inboundExtraTools(url, transferNumber)) {
        const existing = library.find((t: { display_name: string; id: string }) => t.display_name === definition.display_name);
        // The transfer target can change: recreate that tool so the stored number is current.
        if (existing && definition.type === 'transfer') { await telnyx(`/ai/tools/${existing.id}`, 'DELETE').catch(() => null); const at = ids.indexOf(existing.id); if (at >= 0) ids.splice(at, 1); }
        const created = existing && definition.type !== 'transfer' ? null : await telnyx('/ai/tools', 'POST', definition);
        const result = existing && definition.type !== 'transfer' ? existing : created?.data ?? created;
        if (!result?.id) throw new Error('Strumento Telnyx in entrata non creato');
        extra.push(result.id);
      }
      const inboundIds = [...ids.filter(id => library.find((t: any) => t.id === id)?.type !== 'transfer'), ...extra].filter((id, i, a) => a.indexOf(id) === i);
      const inboundConfig = inboundAssistantConfig(inboundIds, url);
      const inbound = settings.inbound_assistant_id ? await telnyx(`/ai/assistants/${settings.inbound_assistant_id}`, 'POST', inboundConfig) : await telnyx('/ai/assistants', 'POST', inboundConfig);
      const inboundId = inbound.data?.id ?? inbound.id;
      if (!inboundId) throw new Error('Assistente in entrata non creato');
      await telnyx(`/texml_applications/${applicationId}`, 'PATCH', { voice_url: `${url}/functions/v1/bruno-voice?texml=1`, voice_method: 'post', status_callback: `${url}/functions/v1/bruno-voice?callback=1&inbound=1`, status_callback_method: 'post' });
      // Portal-level forwarding blocks TeXML routing. Forwarding now lives in our TeXML response, selected by the saved mode.
      const voice = (await telnyx(`/phone_numbers/${owned.id}/voice`)).data;
      if (voice?.call_forwarding?.call_forwarding_enabled) await telnyx(`/phone_numbers/${owned.id}/voice`, 'PATCH', { call_forwarding: { call_forwarding_enabled: false, forwards_to: null, forwarding_type: null } });
      if (owned.connection_id !== applicationId) await telnyx(`/phone_numbers/${owned.id}`, 'PATCH', { connection_id: applicationId });
      checked(await admin.from('bruno_voice_settings').update({ inbound_assistant_id: inboundId, inbound_configured_at: new Date().toISOString() }).eq('key', 'default'));
      return json({ configured: true, inbound: true, inbound_mode: settings.inbound_mode, inbound_forward_number: settings.inbound_mode === 'forward' ? settings.inbound_forward_number : null, from_number: FROM_NUMBER, transfer_number: transferNumber, language: 'en' });
    }
    if (input.action === 'plan_propose') {
      const leads = checked(await admin.from('leads').select('id,contact_name,company_name,phone,archived,status').in('id', input.lead_ids)) ?? [];
      const plan: any = checked(await admin.from('bruno_call_plans').insert({ title: input.title || `Piano chiamate di ${input.call_type} (${input.lead_ids.length})`, call_type: input.call_type, objective: input.objective, instructions: input.instructions, gap_minutes: input.gap_minutes ?? 3, requested_by: user.user.id }).select('id').single());
      const skipped: { lead_id: string; name: string; reason: string }[] = []; let position = 0;
      for (const id of [...new Set(input.lead_ids)]) {
        const lead = leads.find(l => l.id === id); const name = lead?.contact_name || lead?.company_name || 'Cliente';
        if (!lead) { skipped.push({ lead_id: id, name, reason: 'non trovato' }); continue; }
        let destination: string; try { destination = e164(lead.phone || ''); } catch { skipped.push({ lead_id: id, name, reason: 'telefono mancante o senza prefisso' }); continue; }
        const zone = timezoneFromPhone(destination); if (!zone) { skipped.push({ lead_id: id, name, reason: 'prefisso non riconosciuto' }); continue; }
        if (lead.archived || lead.status === 'perso') { skipped.push({ lead_id: id, name, reason: 'archiviato o non interessato' }); continue; }
        checked(await admin.from('bruno_voice_calls').insert({ lead_id: id, objective: input.objective, call_type: input.call_type, instructions: input.instructions, customer_timezone: zone, requested_by: user.user.id, destination, plan_id: plan.id, plan_position: ++position, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() }));
      }
      if (!position) { checked(await admin.from('bruno_call_plans').update({ status: 'cancelled', last_error: 'Nessun cliente chiamabile' }).eq('id', plan.id)); }
      return json({ plan_id: plan.id, calls: position, skipped, approval_required: position > 0 });
    }
    if (input.action === 'plan_detail' || input.action === 'plan_approve' || input.action === 'plan_pause' || input.action === 'plan_resume' || input.action === 'plan_cancel') {
      const plan: any = checked(await admin.from('bruno_call_plans').select('id,title,call_type,objective,instructions,gap_minutes,status,approved_at,last_error,created_at').eq('id', input.plan_id).maybeSingle());
      if (!plan) return json({ error: 'Piano non trovato' }, 404);
      const move = async (from: string[], to: string, extra: Record<string, unknown> = {}) => {
        const row = checked(await admin.from('bruno_call_plans').update({ status: to, ...extra }).eq('id', plan.id).in('status', from).select('id').maybeSingle());
        if (!row) throw new Error('Stato del piano cambiato: ricarica');
      };
      if (input.action === 'plan_approve') {
        await move(['proposed'], 'running', { approved_by: user.user.id, approved_at: new Date().toISOString(), last_error: null });
        checked(await admin.from('bruno_voice_calls').update({ expires_at: new Date(Date.now() + 7 * 86400000).toISOString() }).eq('plan_id', plan.id).eq('status', 'proposed'));
      }
      if (input.action === 'plan_pause') await move(['running'], 'paused');
      if (input.action === 'plan_resume') await move(['paused'], 'running', { last_error: null });
      if (input.action === 'plan_cancel') {
        await move(['proposed', 'running', 'paused'], 'cancelled');
        checked(await admin.from('bruno_voice_calls').update({ status: 'cancelled' }).eq('plan_id', plan.id).eq('status', 'proposed'));
      }
      const fresh = checked(await admin.from('bruno_call_plans').select('id,title,call_type,objective,instructions,gap_minutes,status,approved_at,last_error,created_at').eq('id', plan.id).single());
      const calls = checked(await admin.from('bruno_voice_calls').select('id,lead_id,destination,status,error_code,plan_position,started_at,ended_at,duration_seconds,summary,customer_timezone,leads(contact_name,company_name)').eq('plan_id', plan.id).order('plan_position')) ?? [];
      return json({ plan: fresh, calls });
    }
    if (input.action === 'propose') {
      const lead = checked(await admin.from('leads').select('id,phone,archived,status,bruno_mode,bruno_paused_until,qualification').eq('id', input.lead_id).single());
      if (!lead) return json({ error: 'Cliente non trovato' }, 404);
      const zone = timezoneFromPhone(lead.phone || '') ?? input.customer_timezone;
      if (!zone) return json({ error: 'Prefisso telefonico non riconosciuto: indica il fuso orario del cliente.' }, 422);
      // This branch is reachable only after validating the staff bearer and database role.
      // Operator intent bypasses the autonomy pause, never consent/opt-out or hour guards.
      const blocked = callAllowed(lead, zone, new Date(), 'operator');
      if (blocked) return json({ error: blocked }, 409);
      const { action: _action, ...scope } = input;
      scope.customer_timezone = zone;
      const call = checked(await admin.from('bruno_voice_calls').insert({ ...scope, requested_by: user.user.id, destination: e164(lead.phone || '') }).select('id,destination,objective,status').single());
      return json({ proposal: call, from_number: FROM_NUMBER, language: 'en', approval_required: true });
    }
    const call = checked(await admin.from('bruno_voice_calls').select('*').eq('id', (input as { call_id: string }).call_id).single());
    if (!call) return json({ error: 'Chiamata non trovata' }, 404);
    if (input.action === 'cancel') {
      checked(await admin.from('bruno_voice_calls').update({ status: 'cancelled' }).eq('id', call.id).eq('status', 'proposed'));
      return json({ cancelled: true });
    }
    if (call.status !== 'proposed') return json({ error: 'Chiamata già gestita: nessun nuovo tentativo', status: call.status }, 409);
    if (new Date(call.expires_at).getTime() < Date.now()) return json({ error: 'Proposta scaduta' }, 409);
    if (!settings.assistant_id || !settings.application_id || !settings.public_key) return json({ error: 'Assistente telefonico non ancora configurato' }, 503);
    const lead = checked(await admin.from('leads').select('id,contact_name,company_name,phone,city,country,status,archived,qualification,bruno_mode,bruno_paused_until').eq('id', call.lead_id).single());
    if (!lead) return json({ error: 'Cliente non trovato' }, 404);
    if (e164(lead.phone || '') !== call.destination) return json({ error: 'Telefono modificato: crea una nuova proposta' }, 409);
    // A staff approval executes the stored proposal without resuming lead automation.
    const blocked = callAllowed(lead, call.customer_timezone, new Date(), 'operator');
    if (blocked) return json({ error: blocked }, 409);
    if (call.plan_id) return json({ error: 'Questa chiamata fa parte di un piano: approva il piano.' }, 409);
    const dialed = await dial(admin, settings, url, call, lead, user.user.id);
    return 'error' in dialed ? json({ error: dialed.error }, 409) : json(dialed);
  } catch (error) {
    if (error instanceof ProviderError) return json({ error: 'Richiesta Telnyx non riuscita', status: error.status, details: error.details }, error.status);
    console.error('bruno-voice', error instanceof SyntaxError ? 'invalid_json' : 'operation_failed');
    return json({ error: error instanceof SyntaxError ? 'Richiesta non valida' : 'Operazione chiamate non riuscita' }, error instanceof SyntaxError ? 400 : 500);
  }
});