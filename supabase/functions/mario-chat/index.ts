// Mario internal outbound chat: streams answers using outreach pipeline data and real catalog material (no prices).
import { loadCatalog } from '../_shared/marketing-catalog.ts';
import { catalogWithoutPrices } from '../_shared/marketing-policy.ts';
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

    const catalog = catalogWithoutPrices(await loadCatalog(admin, 'en'));
    const [{ data: settings }, { data: prospects }, { data: runs }] = await Promise.all([
      admin.from('outreach_settings').select('paused,daily_limit,markets,send_markets,cities,sender_email,pause_reason').eq('key', 'default').maybeSingle(),
      admin.from('outreach_prospects').select('kind,name,country,city,email,status,step,replied_at,created_at').order('created_at', { ascending: false }).limit(200),
      admin.from('outreach_runs').select('kind,status,found,sent,error,created_at').order('created_at', { ascending: false }).limit(10),
    ]);
    const counts: Record<string, number> = {};
    for (const p of prospects ?? []) counts[`${p.kind}/${p.country}/${p.status}`] = (counts[`${p.kind}/${p.country}/${p.status}`] ?? 0) + 1;
    const system = `Sei Mario, Outbound Partnership & Customers Manager AI di Vesuviano Forni (forni per pizza artigianali napoletani). Trovi pizzerie (potenziali clienti) e aziende Horeca (potenziali rivenditori/partner) in Regno Unito, Francia e Germania e gestisci sequenze email B2B: avvio (giorno 0), follow-on (giorno 3), follow-up finale (giorno 7). Obiettivo: ottenere risposte e trasformarle in lead o rivenditori.
Regole: usa "Prodotti", mai "Soluzioni"; mai prezzi; email brevi, personalizzate, una sola call to action, disiscrizione chiara; in Germania non si inviano email a freddo (solo raccolta per contatto manuale). Non inventare dati: usa solo i numeri qui sotto. Rispondi in italiano, markdown conciso.
Data attuale: ${new Date().toISOString()}
${instructions ? `Istruzioni del team: ${instructions}\n` : ''}Impostazioni: ${JSON.stringify(settings ?? {})}
Conteggi prospect (tipo/paese/stato, ultimi 200): ${JSON.stringify(counts)}
Ultimi prospect: ${JSON.stringify((prospects ?? []).slice(0, 40))}
Ultime esecuzioni: ${JSON.stringify(runs ?? [])}
Catalogo: ${JSON.stringify({ modelli: catalog.modelli, video: catalog.video, links: catalog.links }).slice(0, 30000)}`;

    const upstream = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
      method: 'POST',
      headers: { 'Lovable-API-Key': apiKey, Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Lovable-AIG-SDK': 'fetch' },
      signal: req.signal,
      body: JSON.stringify({
        model: 'openai/gpt-6-astra',
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
