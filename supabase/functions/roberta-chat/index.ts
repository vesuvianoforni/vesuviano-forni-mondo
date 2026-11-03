// Roberta internal marketing chat: streams plain text answers using real catalog material.
import { ECONOMIC_RESPONSES_MODEL } from '../_shared/ai-models.ts';
import { loadCatalog } from '../_shared/marketing-catalog.ts';
import { OCCASIONS, requestsPrices, catalogWithoutPrices } from '../_shared/marketing-policy.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(8000) })).min(1).max(60),
  instructions: z.string().max(2000).optional(),
});

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!url || !serviceKey || !apiKey) return json({ error: 'Servizio non configurato' }, 503);
    const admin = createClient(url, serviceKey);
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return json({ error: 'Non autenticato' }, 401);
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', u.user.id);
    if (!roles?.some((r) => r.role === 'admin' || r.role === 'commerciale')) return json({ error: 'Accesso negato' }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Richiesta non valida' }, 400);
    const { messages, instructions } = parsed.data;

    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const pricesAllowed = requestsPrices(lastUser);
    const catalog = await loadCatalog(admin, 'it');
    const safeCatalog = pricesAllowed ? catalog : catalogWithoutPrices(catalog);
    const { data: campaigns } = await admin.from('newsletter_campaigns').select('title,subject,status,language,sent_at,created_at,recipients_count').order('created_at', { ascending: false }).limit(15);
    const nowIso = new Date().toISOString();
    const system = `Sei Roberta, Marketing Manager AI di Vesuviano Forni (forni per pizza artigianali napoletani). Lavori con il team interno su email marketing/newsletter, post social e campagne Meta/Google Ads. Usa sempre "Prodotti", mai "Soluzioni". Usa solo materiale reale del catalogo qui sotto (modelli, foto, link, blog, video); non inventare dati.
${pricesAllowed ? 'Il team ha chiesto esplicitamente i prezzi: puoi usare quelli del catalogo.' : 'Non includere MAI prezzi, importi o sconti: il team non li ha chiesti.'}
Ogni contenuto è una bozza che richiede approvazione umana. Rispondi in italiano salvo richiesta diversa, in markdown conciso.
Data attuale: ${nowIso}. Occasioni ricorrenti: ${JSON.stringify(OCCASIONS)}
${instructions ? `Istruzioni del team: ${instructions}\n` : ''}Ultime campagne: ${JSON.stringify(campaigns ?? [])}
Catalogo: ${JSON.stringify({ modelli: safeCatalog.modelli, pronta_consegna: safeCatalog.pronta, articoli: safeCatalog.articoli, video: safeCatalog.video, links: safeCatalog.links, foto: safeCatalog.images.slice(0, 40) }).slice(0, 60000)}`;

    const upstream = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
      method: 'POST',
      headers: { 'Lovable-API-Key': apiKey, Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Lovable-AIG-SDK': 'fetch' },
      signal: req.signal,
      body: JSON.stringify({
        model: ECONOMIC_RESPONSES_MODEL,
        instructions: system,
        input: messages.map((m) => ({ role: m.role, content: m.content })),
        reasoning: { effort: 'low' },
        store: false,
        stream: true,
      }),
    });
    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      console.error('AI gateway', upstream.status, text.slice(0, 500));
      const msg = upstream.status === 429 ? 'Troppe richieste, riprova tra poco.'
        : upstream.status === 402 ? 'Crediti AI esauriti.' : upstream.status === 403 ? 'Accesso AI non disponibile.' : 'Errore AI';
      return json({ error: msg }, upstream.status);
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = '';
    const stream = upstream.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const ev = JSON.parse(data);
            if (ev.type === 'response.output_text.delta' && ev.delta) controller.enqueue(encoder.encode(ev.delta));
          } catch { /* partial */ }
        }
      },
    }));
    const headers: Record<string, string> = { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' };
    const runId = upstream.headers.get('X-Lovable-AIG-Run-ID');
    if (runId) headers['X-Lovable-AIG-Run-ID'] = runId;
    return new Response(stream, { headers });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return new Response(null, { status: 499, headers: corsHeaders });
    console.error(e);
    return json({ error: 'Errore' }, 500);
  }
});
