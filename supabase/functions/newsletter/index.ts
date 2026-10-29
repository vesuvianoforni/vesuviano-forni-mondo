import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { selectRecipients, unsubscribeToken, encodeEmail, decodeEmail, renderNewsletter, NEWSLETTER_FROM, NEWSLETTER_REPLY_TO, type Audience } from './rules.ts';
import { loadCatalog } from './catalog.ts';
import { campaignVersion, languageCounts } from './localization.ts';
import { translateCampaign, translationResponse } from './translate.ts';
import { newsletterSystemPrompt, requestsPrices, catalogWithoutPrices, enforcePricePolicy, scheduledBrief } from './policy.ts';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const Id = z.string().uuid();
const Body = z.discriminatedUnion('action', [
  z.object({ action: z.literal('generate'), campaign_id: Id, prompt: z.string().min(3).max(2000), language: z.enum(['it', 'en', 'fr', 'de', 'es']) }),
  z.object({ action: z.literal('audience'), language: z.enum(['it', 'en', 'fr', 'de', 'es']).optional(), audience: z.object({ stages: z.array(z.string()).max(10), countries: z.array(z.string().max(60)).max(50) }) }),
  z.object({ action: z.literal('assets'), language: z.enum(['it', 'en', 'fr', 'de', 'es']) }),
  z.object({ action: z.literal('roberta_now'), prompt: z.string().trim().min(3).max(2000), language: z.enum(['it', 'en', 'fr', 'de', 'es']) }),
  z.object({ action: z.literal('translate'), campaign_id: Id }),
  z.object({ action: z.literal('preview'), campaign_id: Id, language: z.enum(['it', 'en', 'fr', 'de', 'es']).optional(), recipient_name: z.string().trim().max(160).nullable().optional() }),
  z.object({ action: z.literal('test'), campaign_id: Id, email: z.string().email(), language: z.enum(['it', 'en', 'fr', 'de', 'es']).optional(), recipient_name: z.string().trim().max(160).nullable().optional() }),
  z.object({ action: z.literal('send'), campaign_id: Id }),
]);
const RunBody = z.object({ action: z.literal('roberta_run'), run_id: Id, token: Id });

/** Roberta: picks the fortnight topic herself and saves a draft awaiting human approval. Never sends to customers. */
async function robertaDraft(admin: SupabaseClient, periodKey: string) {
  const { data: paused, error: pauseError } = await admin.from('newsletter_ai_state').select('reason,status').eq('key', 'newsletter').maybeSingle();
  if (pauseError) throw pauseError;
  if (paused) throw Object.assign(new Error(paused.reason), { status: paused.status });
  const { data: past } = await admin.from('newsletter_campaigns').select('title,subject,created_at').order('created_at', { ascending: false }).limit(8);
  const today = new Date().toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', day: 'numeric', month: 'long', year: 'numeric' });
  const prompt = scheduledBrief(periodKey, today, (past || []).map((p) => p.subject || p.title));
  const out = await generate(admin, prompt, 'it', false);
  const { data, error } = await admin.from('newsletter_campaigns').insert({ ...out, title: `Roberta · ${out.title}`, prompt, language: 'it', author: 'roberta', period_key: periodKey }).select().single();
  if (error) throw error;
  try {
    await resendBatch([{ from: NEWSLETTER_FROM, to: [NEWSLETTER_REPLY_TO], subject: `Roberta: newsletter pronta da approvare – ${out.subject}`,
      html: `<p>Ciao, ho preparato una nuova proposta di newsletter${periodKey.startsWith('occasion-') ? ' per un’occasione speciale' : ''}.</p><p><strong>${out.subject}</strong><br>${out.preheader}</p><p><a href="https://vesuvianoforni.com/erp/newsletter">Apri l'ERP per vederla, modificarla e approvarla</a></p><p>Nessuna email è stata inviata ai clienti.<br>— Roberta</p>` }]);
  } catch (e) { console.error('roberta notify', e); }
  return data;
}

async function robertaRun(admin: SupabaseClient, runId: string, token: string) {
  const { data: runs, error: claimError } = await admin.rpc('claim_roberta_run', { _id: runId, _token: token });
  if (claimError) throw claimError;
  const run = runs?.[0];
  if (!run) return json({ error: 'Run non valido' }, 403);
  try {
    const c = await robertaDraft(admin, run.period_key);
    await admin.from('marketing_agent_runs').update({ status: 'done', campaign_id: c.id, lease_until: null, finished_at: new Date().toISOString() }).eq('id', runId);
    return json({ ok: true });
  } catch (e: any) {
    await admin.from('marketing_agent_runs').update({ status: 'failed', lease_until: null, error: String(e.message).slice(0, 300), finished_at: new Date().toISOString() }).eq('id', runId);
    return json({ error: e.message }, e.status || 500);
  }
}

const functionsBase = () => `${Deno.env.get('SUPABASE_URL')}/functions/v1/newsletter`;
const unsubSecret = () => Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
async function unsubscribeUrl(email: string) {
  return `${functionsBase()}?u=${encodeEmail(email)}&t=${await unsubscribeToken(email, unsubSecret())}`;
}

async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>) {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build(from, from + 999);
    if (error) throw error;
    out.push(...(data || []));
    if (!data || data.length < 1000) return out;
  }
}

async function resolveAudience(admin: SupabaseClient, audience: Audience, fallback = 'it') {
  const leads = await fetchAll((a, b) => admin.from('leads').select('id,email,phone,status,country,archived,contact_name').not('email', 'is', null).order('id').range(a, b));
  const unsub = await fetchAll((a, b) => admin.from('newsletter_unsubscribes').select('email').range(a, b));
  return selectRecipients(leads as any, audience, new Set(unsub.map((u: any) => u.email)), fallback);
}

async function resendBatch(emails: unknown[]) {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) throw new Error('RESEND_API_KEY mancante');
  const res = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(emails),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Resend ${res.status}: ${text.slice(0, 300)}`);
  return (JSON.parse(text).data || []) as { id: string }[];
}

async function buildEmail(c: any, to: string, recipientName?: string | null) {
  const url = await unsubscribeUrl(to);
  const { html, text } = renderNewsletter(c, url, recipientName);
  return {
    from: NEWSLETTER_FROM, to: [to], reply_to: NEWSLETTER_REPLY_TO, subject: c.subject, html, text,
    headers: { 'List-Unsubscribe': `<${url}>, <mailto:${NEWSLETTER_REPLY_TO}?subject=unsubscribe>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    tags: [{ name: 'campaign', value: c.id }],
  };
}

async function processCampaign(admin: SupabaseClient, campaign: any) {
  try {
    for (;;) {
      const { data: batch } = await admin.from('newsletter_recipients').select('id,email,language,recipient_name').eq('campaign_id', campaign.id).eq('status', 'pending').limit(50);
      if (!batch?.length) break;
      const ids = batch.map((r) => r.id);
      // Claim before calling Resend so a parallel worker or retry can never mail the same address twice.
      const { data: claimed, error: claimError } = await admin.from('newsletter_recipients').update({ status: 'sending' }).in('id', ids).eq('status', 'pending').select('id,email,language,recipient_name');
      if (claimError) throw claimError;
      if (!claimed?.length) continue;
      try {
        const result = await resendBatch(await Promise.all(claimed.map((r) => buildEmail(campaignVersion(campaign, r.language), r.email, r.recipient_name))));
        await Promise.all(claimed.map((r, i) => admin.from('newsletter_recipients').update({ status: 'sent', resend_id: result[i]?.id || null, sent_at: new Date().toISOString() }).eq('id', r.id)));
      } catch (e) {
        await admin.from('newsletter_recipients').update({ status: 'failed', error: String((e as Error).message).slice(0, 300) }).in('id', claimed.map((r) => r.id));
      }
      const [{ count: sent }, { count: failed }] = await Promise.all([
        admin.from('newsletter_recipients').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id).eq('status', 'sent'),
        admin.from('newsletter_recipients').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id).eq('status', 'failed'),
      ]);
      await admin.from('newsletter_campaigns').update({ sent_count: sent || 0, failed_count: failed || 0 }).eq('id', campaign.id);
      await new Promise((r) => setTimeout(r, 700));
    }
    await admin.from('newsletter_campaigns').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', campaign.id);
  } catch (e) {
    await admin.from('newsletter_campaigns').update({ status: 'failed', last_error: String((e as Error).message).slice(0, 300) }).eq('id', campaign.id);
  }
}

async function generate(admin: SupabaseClient, prompt: string, language: string, allowPrices = requestsPrices(prompt)) {
  const { data: paused, error: stateError } = await admin.from('newsletter_ai_state').select('reason,status').eq('key', 'newsletter').maybeSingle();
  if (stateError) throw stateError;
  if (paused) throw Object.assign(new Error(paused.reason), { status: paused.status });
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw Object.assign(new Error('LOVABLE_API_KEY non configurata'), { status: 500 });
  const catalog = await loadCatalog(admin, language);
  const cat = allowPrices ? catalog : catalogWithoutPrices(catalog);
  const { images, links } = cat;
  const system = newsletterSystemPrompt(language, allowPrices);
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai/gpt-6-astra', reasoning_effort: 'low',
      messages: [{ role: 'system', content: system }, { role: 'user', content: `Richiesta: ${prompt}
Forni pronta consegna disponibili: ${JSON.stringify(cat.pronta)}
Modelli a catalogo: ${JSON.stringify(cat.modelli)}
Articoli blog: ${JSON.stringify(cat.articoli)}
Video commerciali: ${JSON.stringify(cat.video)}
Immagini disponibili: ${JSON.stringify(images)}
Link disponibili: ${JSON.stringify(links)}` }],
      response_format: { type: 'json_schema', json_schema: { name: 'newsletter', strict: true, schema: {
        type: 'object', additionalProperties: false, required: ['title', 'subject', 'preheader', 'body', 'image_url', 'extra_images', 'cta_label', 'cta_url'],
        properties: { title: { type: 'string' }, subject: { type: 'string' }, preheader: { type: 'string' }, body: { type: 'string' },
          image_url: { type: ['string', 'null'] }, extra_images: { type: 'array', items: { type: 'string' } }, cta_label: { type: 'string' }, cta_url: { type: 'string' } } } } },
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = 'Generazione AI non completata.';
    try { const payload = JSON.parse(text); msg = payload.message || payload.error?.message || msg; } catch { /* do not expose raw provider payload */ }
    if (res.status === 402 || res.status === 403) {
      const { error } = await admin.from('newsletter_ai_state').upsert({ key: 'newsletter', status: res.status, reason: msg });
      if (error) throw error;
    }
    throw Object.assign(new Error(msg), { status: res.status });
  }
  const message = JSON.parse(text).choices?.[0]?.message;
  if (message?.refusal || !message?.content) throw Object.assign(new Error(message?.refusal || 'Nessun contenuto generato. Nessuna email è stata inviata.'), { status: 422 });
  const out = JSON.parse(message.content);
  enforcePricePolicy(out, allowPrices);
  const known = new Set(images.map((i) => i.url));
  if (out.image_url && !known.has(out.image_url)) out.image_url = images[0]?.url || null;
  out.extra_images = (out.extra_images || []).filter((u: string) => known.has(u) && u !== out.image_url).slice(0, 3);
  if (!Object.values(links).includes(out.cta_url)) out.cta_url = links.home;
  return out;
}

const page = (msg: string) => new Response(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vesuviano Forni</title></head><body style="font-family:Arial;background:#f3f4f5;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="background:#fff;padding:32px;max-width:420px;text-align:center;border-top:3px solid #8B4513"><h2>Vesuviano Forni</h2><p>${msg}</p></div></body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const url = new URL(req.url);

  // Public unsubscribe (link click = GET, one-click from Gmail/Apple = POST).
  if (url.searchParams.has('u')) {
    try {
      const email = decodeEmail(url.searchParams.get('u')!).toLowerCase();
      if (url.searchParams.get('t') !== await unsubscribeToken(email, unsubSecret())) return page('Link non valido.');
      await admin.from('newsletter_unsubscribes').upsert({ email, reason: req.method === 'POST' ? 'one-click' : 'link' });
      return page('Disiscrizione completata. Non riceverai più le nostre newsletter. / You have been unsubscribed.');
    } catch { return page('Link non valido.'); }
  }

  try {
    const raw = await req.json().catch(() => ({}));
    const run = RunBody.safeParse(raw);
    if (run.success) return await robertaRun(admin, run.data.run_id, run.data.token);

    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return json({ error: 'Non autenticato' }, 401);
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', u.user.id);
    if (!roles?.some((r) => r.role === 'admin' || r.role === 'commerciale')) return json({ error: 'Accesso negato' }, 403);

    const parsed = Body.safeParse(raw);
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const input = parsed.data;

    if (input.action === 'assets') {
      const { images } = await loadCatalog(admin, input.language);
      return json({ images });
    }
    if (input.action === 'roberta_now') {
      try {
        const out = await generate(admin, input.prompt, input.language);
        const { data, error } = await admin.from('newsletter_campaigns').insert({ ...out, prompt: input.prompt, language: input.language, author: 'roberta' }).select().single();
        if (error) throw error;
        return json({ campaign: data });
      } catch (e: any) { return json({ error: e.message }, e.status || 500); }
    }
    if (input.action === 'audience') {
      const r = await resolveAudience(admin, input.audience, input.language);
      return json({ count: r.length, languages: languageCounts(r) });
    }

    const { data: campaign } = await admin.from('newsletter_campaigns').select('*').eq('id', input.campaign_id).maybeSingle();
    if (!campaign) return json({ error: 'Campagna non trovata' }, 404);

    if (input.action === 'translate') {
      if (campaign.status !== 'draft') return json({ error: 'La campagna non è modificabile' }, 409);
      if (!campaign.subject || !campaign.body) return json({ error: 'Genera prima la bozza' }, 400);
      const response = translationResponse(async () => {
        const versions = await translateCampaign(admin, campaign, req);
        const { data, error } = await admin.from('newsletter_campaigns').update(versions).eq('id', campaign.id).eq('status', 'draft').eq('updated_at', campaign.updated_at).select().maybeSingle();
        if (error) throw error;
        if (!data) throw Object.assign(new Error('La bozza è cambiata durante la traduzione. Riprova sulla versione aggiornata.'), { status: 409 });
        return { campaign: data };
      });
      return new Response(response.body, { headers: { ...corsHeaders, ...Object.fromEntries(response.headers) } });
    }

    if (input.action === 'generate') {
      if (campaign.status !== 'draft') return json({ error: 'La campagna è già stata inviata' }, 409);
      try {
        const out = await generate(admin, input.prompt, input.language);
        const { data } = await admin.from('newsletter_campaigns').update({ ...out, prompt: input.prompt, language: input.language, translations: {}, translation_source: null }).eq('id', campaign.id).select().single();
        return json({ campaign: data });
      } catch (e: any) { return json({ error: e.message }, e.status || 500); }
    }
    if (input.action === 'preview') {
      return json(renderNewsletter(campaignVersion(campaign, input.language || campaign.language), `${functionsBase()}?u=preview`, input.recipient_name));
    }
    if (input.action === 'test') {
      const version = campaignVersion(campaign, input.language || campaign.language);
      const email = await buildEmail(version, input.email, input.recipient_name);
      await resendBatch([{ ...email, subject: `[PROVA] ${version.subject}` }]);
      return json({ ok: true });
    }
    // send
    if (campaign.status !== 'draft') return json({ error: 'Campagna già inviata o in invio' }, 409);
    if (!campaign.subject || !campaign.body) return json({ error: 'Oggetto e testo obbligatori' }, 400);
    const recipients = await resolveAudience(admin, campaign.audience, campaign.language);
    if (!recipients.length) return json({ error: 'Nessun destinatario selezionato' }, 400);
    for (const lang of Object.keys(languageCounts(recipients))) campaignVersion(campaign, lang);
    const { data: claimed } = await admin.from('newsletter_campaigns').update({ status: 'sending' }).eq('id', campaign.id).eq('status', 'draft').select().maybeSingle();
    if (!claimed) return json({ error: 'Campagna già in invio' }, 409);
    for (let i = 0; i < recipients.length; i += 500) {
      const { error } = await admin.from('newsletter_recipients').upsert(recipients.slice(i, i + 500).map((r) => ({ ...r, campaign_id: campaign.id })), { onConflict: 'campaign_id,email', ignoreDuplicates: true });
      if (error) throw error;
    }
    await admin.from('newsletter_campaigns').update({ recipients_count: recipients.length }).eq('id', campaign.id);
    // @ts-ignore EdgeRuntime is provided by Supabase
    EdgeRuntime.waitUntil(processCampaign(admin, claimed));
    return json({ ok: true, recipients: recipients.length });
  } catch (e) {
    console.error('newsletter error', e);
    return json({ error: (e as Error).message }, (e as any).status || 500);
  }
});
