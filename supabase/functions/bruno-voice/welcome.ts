// New-lead welcome (owner decision): within minutes Bruno writes on WhatsApp from the UK line, in the customer's
// language, announcing that he will call in 15-20 minutes (next working day outside 9:30-19:30) to collect what
// is needed for a quote, or that they can continue on WhatsApp instead. Bruno then calls once at that time unless
// the customer chose WhatsApp (handled by _shared/bruno/welcome-chat.ts), the lead is paused or the switch is off.
// Every step is claimed before it runs and never repeated.
import { sendUkApproved, renderTemplate } from '../_shared/bruno/uk-whatsapp.ts';
import { welcomeCallAt, welcomeWhen, WELCOME_LANGUAGES, type WelcomeLanguage } from './welcome-schedule.ts';
import { callAllowed, e164, timezoneFromPhone, inboundLanguage } from './domain.ts';

export const WELCOME_TEMPLATE = 'bruno_welcome_call_v2';
export const WELCOME_BODIES: Record<WelcomeLanguage, string> = {
  en: "Hi {{1}}, I'm Bruno from Vesuviano Forni, thank you for your pizza oven request. I will call you {{2}} to collect the details we need to prepare your quote. If you prefer, we can continue here on WhatsApp instead of a call: just reply to this message.",
  it: 'Ciao {{1}}, sono Bruno di Vesuviano Forni, grazie per la tua richiesta sui nostri forni per pizza. Ti chiamerò {{2}} per raccogliere le informazioni utili a prepararti un preventivo. Se preferisci, possiamo proseguire qui su WhatsApp invece della chiamata: rispondi pure a questo messaggio.',
  fr: "Bonjour {{1}}, je suis Bruno de Vesuviano Forni, merci pour votre demande de four à pizza. Je vous appellerai {{2}} pour recueillir les informations nécessaires à votre devis. Si vous préférez, nous pouvons continuer ici sur WhatsApp au lieu d'un appel : il suffit de répondre à ce message.",
  de: 'Hallo {{1}}, hier ist Bruno von Vesuviano Forni, danke für Ihre Anfrage zu unseren Pizzaöfen. Ich rufe Sie {{2}} an, um die Informationen für Ihr Angebot zu sammeln. Wenn Sie möchten, können wir stattdessen hier auf WhatsApp weitermachen: Antworten Sie einfach auf diese Nachricht.',
  es: 'Hola {{1}}, soy Bruno de Vesuviano Forni, gracias por su solicitud sobre nuestros hornos para pizza. Le llamaré {{2}} para recoger la información necesaria para preparar su presupuesto. Si lo prefiere, podemos seguir aquí por WhatsApp en lugar de llamar: basta con responder a este mensaje.',
};
const EXAMPLES: Record<WelcomeLanguage, string[]> = {
  en: ['Marco', 'in about 15-20 minutes (around 11:30)'], it: ['Marco', 'tra circa 15-20 minuti (verso le 11:30)'],
  fr: ['Marco', 'dans environ 15-20 minutes (vers 11:30)'], de: ['Marco', 'in etwa 15-20 Minuten (gegen 11:30 Uhr)'], es: ['Marco', 'en unos 15-20 minutos (hacia las 11:30)'],
};
const FALLBACK_NAME: Record<WelcomeLanguage, string> = { en: 'there', it: 'cliente', fr: 'Madame, Monsieur', de: 'zusammen', es: 'cliente' };
const UK_GATEWAY = 'https://connector-gateway.lovable.dev/whatsapp';

function ukHeaders() {
  const lovable = Deno.env.get('LOVABLE_API_KEY'), connection = Deno.env.get('WHATSAPP_API_KEY');
  if (!lovable || !connection) throw new Error('WhatsApp Bruno UK non collegato');
  return { Authorization: `Bearer ${lovable}`, 'X-Connection-Api-Key': connection, 'Content-Type': 'application/json' };
}
const templatePayload = (language: WelcomeLanguage) => ({ name: WELCOME_TEMPLATE, language, category: 'UTILITY',
  components: [{ type: 'BODY', text: WELCOME_BODIES[language], example: { body_text: [EXAMPLES[language]] } }] });

// Returns the template status on the UK line, creating it once when it does not exist yet.
async function ensureTemplate(language: WelcomeLanguage): Promise<string> {
  const r = await fetch(`${UK_GATEWAY}/message_templates?name=${WELCOME_TEMPLATE}&fields=name,status,language&limit=50`, { headers: ukHeaders(), signal: AbortSignal.timeout(15000) });
  const t = await r.text(); if (!r.ok) throw new Error(`WhatsApp UK [${r.status}]: ${t.slice(0, 300)}`);
  const found = (JSON.parse(t).data ?? []).find((x: any) => x.name === WELCOME_TEMPLATE && x.language === language);
  if (found) return found.status;
  const c = await fetch(`${UK_GATEWAY}/message_templates`, { method: 'POST', headers: ukHeaders(), body: JSON.stringify(templatePayload(language)), signal: AbortSignal.timeout(15000) });
  const ct = await c.text(); if (!c.ok) throw new Error(`Template UK [${c.status}]: ${ct.slice(0, 300)}`);
  return JSON.parse(ct).status ?? 'PENDING';
}
// Creates the five language versions up front so Meta reviews them all at once.
export async function ensureWelcomeTemplates() {
  const out: Record<string, string> = {};
  for (const l of WELCOME_LANGUAGES) out[l] = await ensureTemplate(l).catch(e => `errore: ${e instanceof Error ? e.message.slice(0, 120) : ''}`);
  return out;
}

function checked<T>(r: { data: T; error: { message: string } | null }): T { if (r.error) throw new Error(r.error.message); return r.data; }
export function welcomeLanguage(jobLanguage: string | null | undefined, phone: string): WelcomeLanguage {
  const l = String(jobLanguage || '').slice(0, 2).toLowerCase();
  return (WELCOME_LANGUAGES as string[]).includes(l) ? l as WelcomeLanguage : inboundLanguage(phone).code;
}

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
    const language = welcomeLanguage(job.language, phone);

    if (job.status === 'pending' || job.status === 'waiting_template') {
      if (blocked) { await finish({ status: 'skipped', reason: 'Cliente archiviato o Bruno in pausa' }); return { skipped: 'paused' }; }
      if (Date.now() - new Date(job.created_at).getTime() > 24 * 3600000) { await finish({ status: 'skipped', reason: 'Modello WhatsApp non approvato entro 24 ore' }); return { skipped: 'stale' }; }
      const status = await ensureTemplate(language);
      if (status !== 'APPROVED') { await finish({ status: 'waiting_template', whatsapp_line: 'uk', language, reason: `Modello WhatsApp in revisione Meta (${status})` }); return { waiting: status }; }
      const now = new Date();
      let callAt = welcomeCallAt(new Date(job.created_at));
      if (callAt.getTime() < now.getTime() + 12 * 60000) callAt = welcomeCallAt(now);
      const name = (lead.contact_name || '').trim().split(/\s+/)[0] || FALLBACK_NAME[language];
      const params = [name, welcomeWhen(callAt, now, zone, language)];
      const body = renderTemplate(WELCOME_BODIES[language], params);
      // Reserve the step before submitting: an uncertain send is never repeated.
      checked(await admin.from('bruno_welcome_jobs').update({ status: 'sent', whatsapp_line: 'uk', language, call_at: callAt.toISOString(), sent_at: now.toISOString(), reason: null }).eq('id', job.id));
      const r: any = await sendUkApproved(admin, { lead_id: lead.id, body, ai_generated: true, idempotency_key: job.message_id, template: { name: WELCOME_TEMPLATE, language, params } }, phone.slice(1), sw.updated_by);
      if (r?.error || r?.message?.status === 'failed') { await finish({ status: 'failed', reason: r?.error || r?.message?.error || 'Invio WhatsApp non riuscito' }); return { failed: true }; }
      await finish({}); return { sent: true, call_at: callAt.toISOString() };
    }

    // status === 'sent': the announced call is due. The chat handler records the customer's choice.
    if (job.channel_choice === 'whatsapp' || job.channel_choice === 'stop') { await finish({ status: 'skipped', reason: job.channel_choice === 'stop' ? 'Il cliente non è interessato' : 'Il cliente preferisce WhatsApp: Bruno qualifica in chat' }); return { skipped: 'chat' }; }
    if (job.channel_choice !== 'call') {
      const replied = checked(await admin.from('crm_messages').select('id').eq('lead_id', lead.id).eq('direction', 'inbound').gt('created_at', job.sent_at).limit(1)) as any[];
      if (replied?.length) { await finish({ status: 'skipped', reason: 'Il cliente ha risposto: si prosegue in chat' }); return { skipped: 'replied' }; }
    }
    const earlier = checked(await admin.from('bruno_voice_calls').select('id').eq('lead_id', lead.id).gte('created_at', job.created_at).limit(1)) as any[];
    if (earlier?.length) { await finish({ status: 'skipped', reason: 'Cliente già chiamato' }); return { skipped: 'called' }; }
    const why = callAllowed(lead, zone, new Date(), 'autonomous');
    if (why) { await finish({ status: 'skipped', reason: why }); return { skipped: why }; }
    if (!settings.assistant_id || !settings.application_id) { await finish({ status: 'failed', reason: 'Assistente telefonico non configurato' }); return { failed: true }; }
    const call: any = checked(await admin.from('bruno_voice_calls').insert({ lead_id: lead.id, call_type: 'qualifica', customer_timezone: zone, requested_by: sw.updated_by, destination: phone, language,
      objective: 'Welcome call announced on WhatsApp: collect the information needed to prepare a quote (home or professional use, business type, fuel, size, finish, delivery place and access, timing) and qualify the lead.',
      instructions: 'The customer received a WhatsApp from Bruno announcing this call to collect the details for a quote. If they prefer WhatsApp, agree and end politely.', expires_at: new Date(Date.now() + 3600000).toISOString() }).select('*').single());
    // Move out of 'sent' before dialing so the call can never be placed twice.
    checked(await admin.from('bruno_welcome_jobs').update({ status: 'called', call_id: call.id, lease_until: null }).eq('id', job.id).eq('status', 'sent'));
    try { await dial(call, lead, sw.updated_by); } catch { /* dial() stores failed/unknown; never redialed */ }
    return { dialed: call.id };
  } catch (e) {
    await finish({ reason: e instanceof Error ? e.message.slice(0, 300) : 'Errore benvenuto' });
    return { error: true };
  }
}
