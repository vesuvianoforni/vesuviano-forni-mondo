import { createOpenAI } from 'npm:@ai-sdk/openai@3';
import { streamText, Output, NoObjectGeneratedError } from 'npm:ai@6';
import { z } from 'npm:zod@3';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from './ai/run-id.ts';
import { LANGUAGES, contentSource, type LocalizedCampaign, type Version, type Language } from './localization.ts';
import { loadCatalog } from './catalog.ts';

const Item = z.object({ language: z.string(), subject: z.string(), preheader: z.string(), body: z.string(), cta_label: z.string().nullable(), cta_url: z.string().nullable() });
const Schema = z.object({ versions: z.array(Item) });

export async function translateCampaign(admin: SupabaseClient, campaign: LocalizedCampaign, request: Request) {
  const { data: paused, error: stateError } = await admin.from('newsletter_ai_state').select('reason,status').eq('key', 'newsletter').maybeSingle();
  if (stateError) throw stateError;
  if (paused) throw Object.assign(new Error(paused.reason), { status: paused.status });
  const key = Deno.env.get('LOVABLE_API_KEY');
  if (!key) throw Object.assign(new Error('Configurazione AI mancante.'), { status: 401 });
  const targets = LANGUAGES.filter((l) => l !== campaign.language);
  const catalogs = await Promise.all(targets.map(async (l) => ({ language: l, links: (await loadCatalog(admin, l)).links })));
  const correlation = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    apiKey: key, baseURL: 'https://ai.gateway.lovable.dev/v1',
    headers: { 'Lovable-API-Key': key, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' }, fetch: correlation.fetch,
  });
  const result = streamText({
    model: provider.responses('openai/gpt-6-astra'), maxRetries: 0, abortSignal: request.signal,
    system: `Traduci fedelmente la newsletter Vesuviano nelle lingue richieste. Se l'originale non contiene prezzi, non aggiungerli mai, nemmeno se compaiono nei link o nel catalogo. Non creare nuove offerte o cambiare prezzi, valuta, numeri, modelli, caratteristiche o condizioni. Non aggiungere sconti o urgenza per una ricorrenza. Traduci oggetto, preheader, testo e pulsante. Conserva paragrafi e tono B2B. Non aggiungere informazioni. Per cta_url scegli l'equivalente nella lingua target tra i link forniti; conserva il link originale se non esiste un equivalente. Non scegliere un'altra sezione del sito. Restituisci esattamente una versione per ogni lingua richiesta.`,
    prompt: JSON.stringify({ original: campaign, languages: targets, catalogs }),
    output: Output.object({ schema: Schema }),
    providerOptions: { openai: { forceReasoning: true, reasoningEffort: 'low', reasoningSummary: 'auto', store: false, include: ['reasoning.encrypted_content'] } },
  });
  try {
    let output: z.infer<typeof Schema>;
    try { output = await result.output; }
    catch (e) {
      if (!NoObjectGeneratedError.isInstance(e) || !e.text) throw e;
      output = Schema.parse(JSON.parse(e.text));
    }
    const translations: Partial<Record<Language, Version>> = {};
    for (const target of targets) {
      const version = output.versions.find((v) => v.language === target);
      if (!version?.subject.trim() || !version.body.trim()) throw new Error(`Traduzione ${target.toUpperCase()} non completata.`);
      const links = catalogs.find((c) => c.language === target)?.links || {};
      const cta = version.cta_url && (Object.values(links).includes(version.cta_url) || version.cta_url === campaign.cta_url) ? version.cta_url : campaign.cta_url;
      translations[target] = { subject: version.subject, preheader: version.preheader, body: version.body, cta_label: version.cta_label, cta_url: cta };
    }
    return { translations, translation_source: contentSource(campaign) };
  } catch (e: any) {
    const status = e.statusCode || e.status || 500;
    let reason = 'Traduzione non completata. Nessuna email è stata inviata.';
    try { const upstream = JSON.parse(e.responseBody || '{}'); reason = upstream.message || upstream.error?.message || reason; } catch { /* no unsafe raw payload */ }
    if (status === 402 || status === 403) {
      const { error } = await admin.from('newsletter_ai_state').upsert({ key: 'newsletter', status, reason });
      if (error) throw error;
    }
    throw Object.assign(new Error(reason), { status });
  }
}

/** Keep the browser request alive while the gateway streams; final data or safe error is one JSON line. */
export function translationResponse(work: () => Promise<unknown>) {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('\n'));
      const heartbeat = setInterval(() => controller.enqueue(encoder.encode('\n')), 10000);
      try { controller.enqueue(encoder.encode(JSON.stringify(await work()) + '\n')); }
      catch (e: any) { controller.enqueue(encoder.encode(JSON.stringify({ error: e.message, status: e.status || 500 }) + '\n')); }
      finally { clearInterval(heartbeat); controller.close(); }
    },
  }), { headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' } });
}