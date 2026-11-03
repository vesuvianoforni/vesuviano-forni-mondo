// Bruno internal assistant chat: streams plain text answers about the Vesuviano CRM.
import { ECONOMIC_RESPONSES_MODEL } from '../_shared/ai-models.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { TOOLS, TOOL_LABELS, runTool } from './tools.ts';

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(8000) })).min(1).max(60),
  instructions: z.string().max(2000).optional(),
  propose_writes: z.boolean().optional(),
  execute: z.array(z.object({ name: z.string(), args: z.record(z.any()) })).max(10).optional(),
});

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const STAGES = ['nuovo', 'pre_qualificato', 'qualificato', 'trattativa', 'vinto', 'perso'];

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
    const { messages, instructions, propose_writes, execute } = parsed.data;

    // Compact CRM snapshot (Vesuviano pipeline only).
    const counts: Record<string, number> = {};
    for (const s of STAGES) {
      const { count } = await admin.from('leads').select('id', { count: 'exact', head: true }).eq('pipeline', 'Vesuviano').eq('status', s);
      counts[s] = count ?? 0;
    }
    const nowIso = new Date().toISOString();
    const pick = 'id,contact_name,company_name,status,country,city,phone,email,source,next_activity_type,next_activity_date,created_at,value';
    const [{ data: due }, { data: recent }, { data: open }] = await Promise.all([
      admin.from('leads').select(pick).eq('pipeline', 'Vesuviano').not('status', 'in', '(vinto,perso)').lte('next_activity_date', nowIso).order('next_activity_date').limit(30),
      admin.from('leads').select(pick).eq('pipeline', 'Vesuviano').order('created_at', { ascending: false }).limit(30),
      admin.from('leads').select(pick).eq('pipeline', 'Vesuviano').in('status', ['qualificato', 'trattativa']).order('updated_at', { ascending: false }).limit(40),
    ]);

    const system = `Sei Bruno, agente AI Sales & Back-office di Vesuviano Forni (forni per pizza artigianali napoletani: Anastasia, Ottavio, Real Bosco, Sebastian, VesuvioBuono, Forno Rotante; legna, gas, elettrico, rotante). Pagamento 50% acconto, 50% a merce pronta per la spedizione. Usa sempre "Prodotti", mai "Soluzioni".
Parli con il team commerciale interno (Gennaro). Hai accesso operativo all'ERP tramite strumenti: cercare e aggiornare clienti (fase, note, prossima attività), creare clienti, inviare email/WhatsApp ai clienti, leggere il listino, creare offerte, inserire e aggiornare ordini. Usa gli strumenti quando l'operatore chiede un'azione; per cercare un cliente usa search_leads e poi l'id. Invia messaggi ai clienti solo se l'operatore lo chiede esplicitamente o conferma il testo. Prezzi solo da get_catalog o dall'operatore, mai inventati; se manca un dato essenziale chiedilo. Dopo le azioni riassumi cosa hai fatto. Rispondi in italiano salvo richiesta diversa, in markdown conciso.
Data attuale: ${nowIso}.
${instructions ? `Istruzioni del team: ${instructions}\n` : ''}Dati CRM (pipeline Vesuviano):
Lead per fase: ${JSON.stringify(counts)}
Attività scadute o di oggi: ${JSON.stringify(due ?? [])}
Lead più recenti: ${JSON.stringify(recent ?? [])}
In qualificato/trattativa: ${JSON.stringify(open ?? [])}`;

    const ctx = { admin, userId: u.user.id, auth: req.headers.get('Authorization') || '', url, anon: Deno.env.get('SUPABASE_ANON_KEY') || '' };
    // Approved proposals: run exactly the stored actions, no AI involved.
    if (execute?.length) {
      const lines: string[] = [];
      for (const a of execute) {
        if (!TOOL_LABELS[a.name]) { lines.push(`- ❌ ${a.name}: azione non ammessa`); continue; }
        try {
          const r: any = await runTool(ctx, a.name, a.args);
          lines.push(r?.error ? `- ❌ ${TOOL_LABELS[a.name]}: ${r.error}` : `- ✅ ${TOOL_LABELS[a.name]}`);
        } catch (e) { lines.push(`- ❌ ${TOOL_LABELS[a.name]}: ${e instanceof Error ? e.message : 'errore'}`); }
      }
      return json({ text: lines.join('\n') });
    }
    const proposals: { name: string; args: Record<string, unknown> }[] = [];
    const input: unknown[] = messages.map((m) => ({ role: m.role, content: m.content }));
    const done: string[] = [];
    let text = '';
    for (let round = 0; round < 8; round++) {
      const res = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
        method: 'POST', signal: req.signal,
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: ECONOMIC_RESPONSES_MODEL, instructions: system, input, tools: TOOLS, reasoning: { effort: 'low' }, store: false }),
      });
      if (!res.ok) {
        console.error('AI gateway', res.status, (await res.text()).slice(0, 500));
        const msg = res.status === 429 ? 'Troppe richieste, riprova tra poco.' : res.status === 402 ? 'Crediti AI esauriti.' : res.status === 403 ? 'Accesso AI non disponibile.' : 'Errore AI';
        return json({ error: msg }, res.status);
      }
      const out = (await res.json()).output ?? [];
      const calls = out.filter((o: any) => o.type === 'function_call');
      text = out.filter((o: any) => o.type === 'message').flatMap((o: any) => o.content ?? []).filter((c: any) => c.type === 'output_text').map((c: any) => c.text).join('');
      if (!calls.length) break;
      input.push(...out.filter((o: any) => o.type !== 'reasoning'));
      for (const c of calls) {
        let result: any;
        try {
          const args = JSON.parse(c.arguments || '{}');
          if (propose_writes && TOOL_LABELS[c.name]) {
            proposals.push({ name: c.name, args });
            result = { status: 'proposta registrata, in attesa di approvazione del team: NON è stata eseguita' };
            input.push({ type: 'function_call_output', call_id: c.call_id, output: JSON.stringify(result) });
            continue;
          }
          result = await runTool(ctx, c.name, args);
          if (TOOL_LABELS[c.name] && !result?.error) done.push(`${TOOL_LABELS[c.name]}${result?._link ? ` ([apri](${result._link}))` : ''}`);
        } catch (e) { result = { error: e instanceof Error ? e.message : 'Operazione non riuscita' }; console.error('tool', c.name, result.error); }
        input.push({ type: 'function_call_output', call_id: c.call_id, output: JSON.stringify(result).slice(0, 12000) });
      }
    }
    if (propose_writes) return json({ text: text || 'Ecco la proposta.', proposals });
    const final = (text || 'Fatto.') + (done.length ? `\n\n---\n**Azioni eseguite:**\n${done.map((d) => `- ✅ ${d}`).join('\n')}` : '');
    return new Response(final, { headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return new Response(null, { status: 499, headers: corsHeaders });
    console.error(e);
    return json({ error: 'Errore' }, 500);
  }
});
