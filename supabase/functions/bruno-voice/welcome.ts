// New-lead welcome (owner decision): Bruno introduces himself on WhatsApp from the customer's country line,
// announces the call time and offers to continue on WhatsApp; Bruno UK then calls once at that time unless the
// customer replied, the lead is paused or the switch is off. Every step is claimed before it runs and never repeated.
import { lineFor } from '../_shared/bruno/whatsapp-lines.ts';
import { sendUkApproved, renderTemplate } from '../bruno-agent/uk-whatsapp.ts';
import { sendWhatsApp } from '../bruno-agent/meta-whatsapp.ts';
import { welcomeCallAt, welcomeLabels } from './welcome-schedule.ts';
import { callAllowed, e164, timezoneFromPhone } from './domain.ts';

export const WELCOME_TEMPLATE = 'bruno_welcome_call';
export const WELCOME_BODIES = {
  en: "Hi {{1}}, I'm Bruno from Vesuviano Forni, thank you for your request about our pizza ovens. I will call you {{2}} at {{3}} to understand your needs and share all the details. If you prefer, we can continue here on WhatsApp instead of a call: just reply to this message.",
  it: 'Ciao {{1}}, sono Bruno di Vesuviano Forni, grazie per la tua richiesta sui nostri forni per pizza. Ti chiamerò {{2}} alle {{3}} per capire le tue esigenze e darti tutti i dettagli. Se preferisci, possiamo proseguire qui su WhatsApp invece della chiamata: rispondi pure a questo messaggio.',
} as const;
const EXAMPLES = { en: ['Marco', 'today', '11:30'], it: ['Marco', 'oggi', '11:30'] };
const GRAPH = 'https://graph.facebook.com/v21.0';
const UK_GATEWAY = 'https://connector-gateway.lovable.dev/whatsapp';

function ukHeaders() {
  const lovable = Deno.env.get('LOVABLE_API_KEY'), connection = Deno.env.get('WHATSAPP_API_KEY');
  if (!lovable || !connection) throw new Error('WhatsApp Bruno UK non collegato');
  return { Authorization: `Bearer ${lovable}`, 'X-Connection-Api-Key': connection, 'Content-Type': 'application/json' };
}
function itCreds() {
  const token = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN'), wabaId = Deno.env.get('META_WHATSAPP_WABA_ID');
  if (!token || !wabaId) throw new Error('WhatsApp Bruno IT non configurato');
  return { token, wabaId };
}
const templatePayload = (language: 'it' | 'en') => ({ name: WELCOME_TEMPLATE, language, category: 'UTILITY',
  components: [{ type: 'BODY', text: WELCOME_BODIES[language], example: { body_text: [EXAMPLES[language]] } }] });

// Returns the template status on that line, creating it once when it does not exist yet.
async function ensureTemplate(line: 'uk' | 'it', language: 'it' | 'en'): Promise<string> {
  if (line === 'uk') {
    const r = await fetch(`${UK_GATEWAY}/message_templates?name=${WELCOME_TEMPLATE}&fields=name,status,language&limit=50`, { headers: ukHeaders(), signal: AbortSignal.timeout(15000) });
    const t = await r.text(); if (!r.ok) throw new Error(`WhatsApp UK [${r.status}]: ${t.slice(0, 300)}`);
    const found = (JSON.parse(t).data ?? []).find((x: any) => x.name === WELCOME_TEMPLATE && x.language === language);
    if (found) return found.status;
    const c = await fetch(`${UK_GATEWAY}/message_templates`, { method: 'POST', headers: ukHeaders(), body: JSON.stringify(templatePayload(language)), signal: AbortSignal.timeout(15000) });
    const ct = await c.text(); if (!c.ok) throw new Error(`Template UK [${c.status}]: ${ct.slice(0, 300)}`);
    return JSON.parse(ct).status ?? 'PENDING';
  }
  const { token, wabaId } = itCreds();
  const r = await fetch(`${GRAPH}/${wabaId}/message_templates?name=${WELCOME_TEMPLATE}&fields=name,status,language&limit=50`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
  const t = await r.text(); if (!r.ok) throw new Error(`Meta [${r.status}]: ${t.slice(0, 300)}`);
  const found = (JSON.parse(t).data ?? []).find((x: any) => x.name === WELCOME_TEMPLATE && x.language === language);
  if (found) return found.status;
  const c = await fetch(`${GRAPH}/${wabaId}/message_templates`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(templatePayload(language)), signal: AbortSignal.timeout(15000) });
  const ct = await c.text(); if (!c.ok) throw new Error(`Template IT [${c.status}]: ${ct.slice(0, 300)}`);
  return JSON.parse(ct).status ?? 'PENDING';
}

function checked<T>(r: { data: T; error: { message: string } | null }): T { if (r.error) throw new Error(r.error.message); return r.data; }

// deno-lint-ignore no-explicit-any
export async function welcomeTick(admin: any, settings: any, jobId: string, token: string, dial: (call: any, lead: any, approver: string) => Promise<unknown>) {
  const job: any = (checked(await admin.rpc('claim_bruno_welcome_job', { p_id: jobId, p_token: token })) as any[] | null)?.[0];
  if (!job) return { ignored: true };
  const finish = (fields: Record<string, unknown>) => admin.from('bruno_welcome_jobs').update({ lease_until: null, ...fields }).eq('id', job.id);
  try {
    const sw = checked(await admin.from('bruno_automations').select('enabled,updated_by').eq('key', 'new_lead_welcome').maybeSingle()) as any;
    if (!sw?.enabled || !sw.updated_by) { await finish({ status: 'skipped', reason: 'Automatismo spento' }); return { skipped: 'disabled' }; }
    const lead: any = checked(await admin.from('leads').select('id,contact_name,company_name,phone,city,country,status,archived,qualification,bruno_mode,bruno_paused_until,next_activity_date').eq('id', job.lead_id).single());
    let phone: string; try { phone = e164(lead.phone || ''); } catch { await finish({ status: 'skipped', reason: 'Telefono senza prefisso internazionale' }); return { skipped: 'phone' }; }
    const zone = timezoneFromPhone(phone) ?? 'Europe/Rome';
    const blocked = lead.archived || lead.status === 'perso' || lead.bruno_mode === 'off' || lead.bruno_mode === 'paused' || (lead.bruno_paused_until && new Date(lead.bruno_paused_until) > new Date());
    const ukLine = lineFor(phone)?.key === 'uk';

    if (job.status === 'pending' || job.status === 'waiting_template') {
      if (blocked) { await finish({ status: 'skipped', reason: 'Cliente archiviato o Bruno in pausa' }); return { skipped: 'paused' }; }
      if (Date.now() - new Date(job.created_at).getTime() > 24 * 3600000) { await finish({ status: 'skipped', reason: 'Modello WhatsApp non approvato entro 24 ore' }); return { skipped: 'stale' }; }
      const language: 'it' | 'en' = ukLine ? 'en' : (job.language === 'it' || (!job.language && phone.startsWith('+39')) ? 'it' : 'en');
      const line: 'uk' | 'it' = ukLine ? 'uk' : 'it';
      const status = await ensureTemplate(line, language);
      if (status !== 'APPROVED') { await finish({ status: 'waiting_template', whatsapp_line: line, language, reason: `Modello WhatsApp in revisione Meta (${status})` }); return { waiting: status }; }
      const now = new Date();
      let callAt = welcomeCallAt(new Date(job.created_at));
      if (callAt.getTime() < now.getTime() + 20 * 60000) callAt = welcomeCallAt(now);
      const labels = welcomeLabels(callAt, now, zone, language);
      const name = (lead.contact_name || '').trim().split(/\s+/)[0] || (language === 'it' ? 'cliente' : 'there');
      const params = [name, labels.day, labels.time];
      const body = renderTemplate(WELCOME_BODIES[language], params);
      // Reserve the step before submitting: an uncertain send is never repeated.
      checked(await admin.from('bruno_welcome_jobs').update({ status: 'sent', whatsapp_line: line, language, call_at: callAt.toISOString(), sent_at: now.toISOString(), reason: null }).eq('id', job.id));
      const template = { name: WELCOME_TEMPLATE, language, params };
      if (line === 'uk') {
        const r: any = await sendUkApproved(admin, { lead_id: lead.id, body, ai_generated: true, idempotency_key: job.message_id, template }, phone.slice(1), sw.updated_by);
        if (r?.error || r?.message?.status === 'failed') { await finish({ status: 'failed', reason: r?.error || r?.message?.error || 'Invio WhatsApp non riuscito' }); return { failed: true }; }
      } else {
        const claim = await admin.from('crm_messages').insert({ id: job.message_id, lead_id: lead.id, channel: 'whatsapp_api', direction: 'outbound', sender: 'bruno', body, status: 'queued', ai_generated: true, created_by: sw.updated_by, metadata: { whatsapp_line: 'it', template: WELCOME_TEMPLATE, submission_status: 'sending' } }).select('id').single();
        if (claim.error) { await finish({ status: 'failed', reason: 'Invio già registrato: verifica lo storico' }); return { failed: true }; }
        let externalId: string | null = null, error: string | null = null;
        try { externalId = await sendWhatsApp(phone.slice(1), { template }, 'it'); } catch (e) { error = e instanceof Error ? e.message.slice(0, 300) : 'Esito invio incerto'; }
        checked(await admin.from('crm_messages').update({ status: externalId ? 'sent' : 'failed', external_id: externalId, error, metadata: { whatsapp_line: 'it', template: WELCOME_TEMPLATE, submission_status: externalId ? 'accepted' : 'unknown' } }).eq('id', job.message_id));
        if (!externalId) { await finish({ status: 'failed', reason: error }); return { failed: true }; }
      }
      if (!ukLine) {
        // Bruno's voice line speaks English from the UK number: the team makes the announced call.
        if (!lead.next_activity_date) checked(await admin.from('leads').update({ next_activity_type: 'chiamata', next_activity_date: callAt.toISOString(), next_activity_notes: 'Chiamata di benvenuto annunciata da Bruno su WhatsApp' }).eq('id', lead.id));
        await finish({ status: 'done' }); return { sent: true, team_call: true };
      }
      await finish({}); return { sent: true, call_at: callAt.toISOString() };
    }

    // status === 'sent': the announced call is due.
    const replied = checked(await admin.from('crm_messages').select('id').eq('lead_id', lead.id).eq('direction', 'inbound').gt('created_at', job.sent_at).limit(1)) as any[];
    if (replied?.length) { await finish({ status: 'skipped', reason: 'Il cliente ha risposto: si prosegue in chat' }); return { skipped: 'replied' }; }
    const earlier = checked(await admin.from('bruno_voice_calls').select('id').eq('lead_id', lead.id).gte('created_at', job.created_at).limit(1)) as any[];
    if (earlier?.length) { await finish({ status: 'skipped', reason: 'Cliente già chiamato' }); return { skipped: 'called' }; }
    const why = callAllowed(lead, zone, new Date(), 'autonomous');
    if (why) { await finish({ status: 'skipped', reason: why }); return { skipped: why }; }
    if (!settings.assistant_id || !settings.application_id) { await finish({ status: 'failed', reason: 'Assistente telefonico non configurato' }); return { failed: true }; }
    const call: any = checked(await admin.from('bruno_voice_calls').insert({ lead_id: lead.id, call_type: 'qualifica', customer_timezone: zone, requested_by: sw.updated_by, destination: phone,
      objective: 'Welcome call announced on WhatsApp: introduce Vesuviano Forni, understand the customer needs (business type, oven type, fuel, timing, budget) and qualify the lead.',
      instructions: 'The customer received a WhatsApp from Bruno announcing this call. If they prefer WhatsApp, agree and end politely.', expires_at: new Date(Date.now() + 3600000).toISOString() }).select('*').single());
    // Move out of 'sent' before dialing so the call can never be placed twice.
    checked(await admin.from('bruno_welcome_jobs').update({ status: 'called', call_id: call.id, lease_until: null }).eq('id', job.id).eq('status', 'sent'));
    try { await dial(call, lead, sw.updated_by); } catch { /* dial() stores failed/unknown; never redialed */ }
    return { dialed: call.id };
  } catch (e) {
    await finish({ reason: e instanceof Error ? e.message.slice(0, 300) : 'Errore benvenuto' });
    return { error: true };
  }
}
