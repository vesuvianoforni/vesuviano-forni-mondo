import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { selectRecipients, unsubscribeToken, encodeEmail, decodeEmail, renderNewsletter, NEWSLETTER_FROM, NEWSLETTER_REPLY_TO, type Audience } from './rules.ts';
import { loadCatalog } from './catalog.ts';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const Id = z.string().uuid();
const Body = z.discriminatedUnion('action', [
  z.object({ action: z.literal('generate'), campaign_id: Id, prompt: z.string().min(3).max(2000), language: z.enum(['it', 'en', 'fr', 'de', 'es']) }),
  z.object({ action: z.literal('audience'), audience: z.object({ stages: z.array(z.string()).max(10), countries: z.array(z.string().max(60)).max(50) }) }),
  z.object({ action: z.literal('assets'), language: z.enum(['it', 'en', 'fr', 'de', 'es']) }),
  z.object({ action: z.literal('roberta_now') }),
  z.object({ action: z.literal('preview'), campaign_id: Id }),
  z.object({ action: z.literal('test'), campaign_id: Id, email: z.string().email() }),
  z.object({ action: z.literal('send'), campaign_id: Id }),
]);
const RunBody = z.object({ action: z.literal('roberta_run'), run_id: Id, token: Id });

/** Roberta: picks the fortnight topic herself and saves a draft awaiting human approval. Never sends to customers. */
async function robertaDraft(admin: SupabaseClient, periodKey: string) {
  const { data: past } = await admin.from('newsletter_campaigns').select('title,subject,created_at').order('created_at', { ascending: false }).limit(8);
  const today = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  const prompt = `Sei Roberta, Marketing Manager di Vesuviano Forni. Oggi è ${today}: prepara la newsletter dei prossimi 15 giorni.
Scegli TU l'argomento più efficace per vendere adesso, ragionando su stagionalità e tempi di produzione/consegna, forni in pronta consegna disponibili, modelli, articoli blog e video reali.
Evita di ripetere gli argomenti delle ultime campagne: ${JSON.stringify((past || []).map((p) => p.subject || p.title))}.`;
  const out = await generate(admin, prompt, 'it');
  const { data, error } = await admin.from('newsletter_campaigns').insert({ ...out, title: `Roberta · ${out.title}`, prompt, language: 'it', author: 'roberta', period_key: periodKey }).select().single();
  if (error) throw error;
  try {
    await resendBatch([{ from: NEWSLETTER_FROM, to: [NEWSLETTER_REPLY_TO], subject: `Roberta: newsletter pronta da approvare – ${out.subject}`,
      html: `<p>Ciao, ho preparato la newsletter dei prossimi 15 giorni.</p><p><strong>${out.subject}</strong><br>${out.preheader}</p><p><a href="https://vesuvianoforni.com/erp/newsletter">Apri l'ERP per vederla, modificarla e approvarla</a></p><p>Nessuna email è stata inviata ai clienti.<br>— Roberta</p>` }]);
  } catch (e) { console.error('roberta notify', e); }
  return data;
}

async function robertaRun(admin: SupabaseClient, runId: string, token: string) {
  const { data: run } = await admin.from('marketing_agent_runs').update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', runId).eq('worker_token', token).eq('status', 'queued').select().maybeSingle();
  if (!run) return json({ error: 'Run non valido' }, 403);
  try {
    const c = await robertaDraft(admin, run.period_key);
    await admin.from('marketing_agent_runs').update({ status: 'done', campaign_id: c.id, finished_at: new Date().toISOString() }).eq('id', runId);
    return json({ ok: true });
  } catch (e: any) {
    await admin.from('marketing_agent_runs').update({ status: 'failed', error: String(e.message).slice(0, 300), finished_at: new Date().toISOString() }).eq('id', runId);
    return json({ error: e.message }, 500);
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

async function resolveAudience(admin: SupabaseClient, audience: Audience) {
  const leads = await fetchAll((a, b) => admin.from('leads').select('id,email,status,country,archived').not('email', 'is', null).range(a, b));
  const unsub = await fetchAll((a, b) => admin.from('newsletter_unsubscribes').select('email').range(a, b));
  return selectRecipients(leads as any, audience, new Set(unsub.map((u: any) => u.email)));
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

async function buildEmail(c: any, to: string) {
  const url = await unsubscribeUrl(to);
  const { html, text } = renderNewsletter(c, url);
  return {
    from: NEWSLETTER_FROM, to: [to], reply_to: NEWSLETTER_REPLY_TO, subject: c.subject, html, text,
    headers: { 'List-Unsubscribe': `<${url}>, <mailto:${NEWSLETTER_REPLY_TO}?subject=unsubscribe>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    tags: [{ name: 'campaign', value: c.id }],
  };
}

async function processCampaign(admin: SupabaseClient, campaign: any) {
  try {
    for (;;) {
      const { data: batch } = await admin.from('newsletter_recipients').select('id,email').eq('campaign_id', campaign.id).eq('status', 'pending').limit(50);
      if (!batch?.length) break;
      const ids = batch.map((r) => r.id);
      // Claim before calling Resend so a parallel worker or retry can never mail the same address twice.
      await admin.from('newsletter_recipients').update({ status: 'sending' }).in('id', ids).eq('status', 'pending');
      try {
        const result = await resendBatch(await Promise.all(batch.map((r) => buildEmail(campaign, r.email))));
        await Promise.all(batch.map((r, i) => admin.from('newsletter_recipients').update({ status: 'sent', resend_id: result[i]?.id || null, sent_at: new Date().toISOString() }).eq('id', r.id)));
      } catch (e) {
        await admin.from('newsletter_recipients').update({ status: 'failed', error: String((e as Error).message).slice(0, 300) }).in('id', ids);
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

async function generate(admin: SupabaseClient, prompt: string, language: string) {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw Object.assign(new Error('LOVABLE_API_KEY non configurata'), { status: 500 });
  const cat = await loadCatalog(admin, language);
  const { images, links } = cat;
  const system = `Sei il copywriter di Vesuviano Forni (forni per pizza artigianali napoletani fatti a mano a Sant'Anastasia e Boscoreale con sabbia vulcanica: Anastasia, Ottavio, Real Bosco, Sebastian, VesuvioBuono, Forno Rotante; legna, gas, elettrico, rotante). Pagamento 50% acconto, 50% alla consegna. Usa "Prodotti", mai "Soluzioni".
Scrivi newsletter B2B per pizzaioli e ristoratori: oggetto breve e concreto (max 60 caratteri, niente maiuscole urlate né parole spam come GRATIS/!!!), preheader max 90 caratteri, corpo in testo semplice con paragrafi separati da riga vuota, 120-220 parole, tono caldo ed esperto, una sola call to action. Scrivi interamente nella lingua: ${language}.
Usa SOLO il materiale reale fornito: se la richiesta riguarda un forno pronta consegna specifico, usa i suoi dati (prezzi, diametro, rivestimento, consegna) e le SUE foto; per un modello usa le sue foto; per un articolo o un video usa il suo link. Non inventare prezzi, sconti o specifiche.
image_url = foto principale scelta tra le immagini fornite (o null); extra_images = da 0 a 3 altre foto della stessa offerta/modello; cta_url SOLO tra i link forniti, il più pertinente (pagina della sezione giusta del sito nella lingua del cliente).`;
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
    console.error('AI gateway', res.status, text);
    const msg = res.status === 429 ? 'Troppe richieste, riprova tra poco.' : res.status === 402 ? 'Crediti AI esauriti.' : 'Errore AI';
    throw Object.assign(new Error(msg), { status: res.status });
  }
  const out = JSON.parse(JSON.parse(text).choices?.[0]?.message?.content || '{}');
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
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return json({ error: 'Non autenticato' }, 401);
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', u.user.id);
    if (!roles?.some((r) => r.role === 'admin' || r.role === 'commerciale')) return json({ error: 'Accesso negato' }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const input = parsed.data;

    if (input.action === 'audience') {
      const r = await resolveAudience(admin, input.audience);
      return json({ count: r.length, sample: r.slice(0, 5).map((x) => x.email) });
    }

    const { data: campaign } = await admin.from('newsletter_campaigns').select('*').eq('id', input.campaign_id).maybeSingle();
    if (!campaign) return json({ error: 'Campagna non trovata' }, 404);

    if (input.action === 'generate') {
      if (campaign.status !== 'draft') return json({ error: 'La campagna è già stata inviata' }, 409);
      try {
        const out = await generate(admin, input.prompt, input.language);
        const { data } = await admin.from('newsletter_campaigns').update({ ...out, prompt: input.prompt, language: input.language }).eq('id', campaign.id).select().single();
        return json({ campaign: data });
      } catch (e: any) { return json({ error: e.message }, e.status || 500); }
    }
    if (input.action === 'preview') {
      return json(renderNewsletter(campaign, `${functionsBase()}?u=preview`));
    }
    if (input.action === 'test') {
      const email = await buildEmail(campaign, input.email);
      await resendBatch([{ ...email, subject: `[PROVA] ${campaign.subject}` }]);
      return json({ ok: true });
    }
    // send
    if (campaign.status !== 'draft') return json({ error: 'Campagna già inviata o in invio' }, 409);
    if (!campaign.subject || !campaign.body) return json({ error: 'Oggetto e testo obbligatori' }, 400);
    const { data: claimed } = await admin.from('newsletter_campaigns').update({ status: 'sending' }).eq('id', campaign.id).eq('status', 'draft').select().maybeSingle();
    if (!claimed) return json({ error: 'Campagna già in invio' }, 409);
    const recipients = await resolveAudience(admin, campaign.audience);
    for (let i = 0; i < recipients.length; i += 500) {
      await admin.from('newsletter_recipients').upsert(recipients.slice(i, i + 500).map((r) => ({ ...r, campaign_id: campaign.id })), { onConflict: 'campaign_id,email', ignoreDuplicates: true });
    }
    await admin.from('newsletter_campaigns').update({ recipients_count: recipients.length }).eq('id', campaign.id);
    // @ts-ignore EdgeRuntime is provided by Supabase
    EdgeRuntime.waitUntil(processCampaign(admin, claimed));
    return json({ ok: true, recipients: recipients.length });
  } catch (e) {
    console.error('newsletter error', e);
    return json({ error: (e as Error).message }, 500);
  }
});
