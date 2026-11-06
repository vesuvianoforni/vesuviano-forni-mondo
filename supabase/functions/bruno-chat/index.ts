// Bruno internal assistant chat: streams plain text answers about the Vesuviano CRM.
import { ECONOMIC_RESPONSES_MODEL } from '../_shared/ai-models.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { TOOLS, TOOL_LABELS, runTool } from './tools.ts';
import { customerPersona, TOOL_MAP } from '../_shared/bruno/persona.ts';
import { saveAction, executeAction } from './actions.ts';
import { WorkspaceRequest, workspace } from './workspace.ts';
import { WRITE_TOOLS } from './action-domain.ts';

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(8000) })).min(1).max(60),
  instructions: z.string().max(2000).optional(),
  propose_writes: z.boolean().optional(),
  execute: z.array(z.object({ name: z.string(), args: z.record(z.any()), action_id: z.string().uuid().optional() })).max(10).optional(),
  source: z.enum(['erp','telegram']).optional(),
  requested_label: z.string().max(150).optional(),
  pending_id: z.string().uuid().optional(),
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

    const payload=await req.json();
    const auth=req.headers.get('Authorization') || '';
    const ctx = { admin, userId: u.user.id, auth, url, anon: Deno.env.get('SUPABASE_ANON_KEY') || '', source: payload.source || 'erp', requestText: payload.messages?.filter((m:any)=>m.role==='user').at(-1)?.content || '', requestedLabel:payload.requested_label };
    const executeTool=(name:string,args:Record<string,unknown>,id:string)=>runTool({...ctx,actionId:id},name,args);
    const operational=WorkspaceRequest.safeParse(payload);
    if(operational.success) {
      const reader=createClient(url,ctx.anon,{global:{headers:{Authorization:auth}}});
      return json(await workspace(ctx,reader,operational.data,executeTool));
    }
    const parsed = Body.safeParse(payload);
    if (!parsed.success) return json({ error: 'Richiesta non valida' }, 400);
    const { messages, instructions } = parsed.data;
    let execute = parsed.data.execute;
    if(parsed.data.pending_id){
      const pending=await admin.from('telegram_pending').select('chat_id,status,actions').eq('id',parsed.data.pending_id).single();
      if(pending.error||pending.data?.status!=='approved')return json({error:'Proposta Telegram non approvata'},409);
      const link=await admin.from('telegram_links').select('user_id').eq('chat_id',pending.data.chat_id).eq('user_id',u.user.id).maybeSingle();
      if(link.error||!link.data)return json({error:'Proposta Telegram non associata a questo utente'},403);
      const approved=Body.shape.execute.safeParse(pending.data.actions);
      if(!approved.success||!approved.data?.length)return json({error:'Proposta non valida: preparane una nuova'},400);
      execute=approved.data;
    }
    const propose_writes=true;

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
Parli con il team commerciale interno (Gennaro). Hai accesso operativo all'ERP tramite strumenti: cercare e aggiornare clienti (fase, note, prossima attività), creare clienti, inviare email/WhatsApp ai clienti, leggere il listino, creare offerte (create_offer genera sempre link pubblico e PDF; con send_via la invia subito), inviare offerte esistenti (send_offer), inserire e aggiornare ordini. Usa gli strumenti quando l'operatore chiede un'azione; per cercare un cliente usa search_leads e poi l'id. Invia messaggi ai clienti solo se l'operatore lo chiede esplicitamente o conferma il testo. Prezzi solo da get_catalog o dall'operatore, mai inventati; se manca un dato essenziale chiedilo. Canali WhatsApp per send_message: di default usa "wasender" (WhatsApp di Gennaro, il commerciale: relazione, follow-up, trattativa); usa "whatsapp_api" (linea ufficiale di Bruno) quando l'operatore lo chiede o per messaggi di servizio/automatici; se l'operatore indica un canale, usa quello. Per inviare preventivi usa di default "wasender" (WhatsApp di Gennaro) o "email" se richiesto; riporta sempre link offerta e link PDF. LINGUA DEL CLIENTE: l'operatore ti dà istruzioni in italiano (anche sommarie o con errori); tu componi il messaggio per il cliente come un commerciale madrelingua nella lingua del cliente: prima chiama get_lead e usa customer_language (dal prefisso telefonico/paese), ma la lingua in cui il cliente ti scrive ha SEMPRE la precedenza sul prefisso: guarda i messaggi in arrivo più recenti e, se il cliente scrive in italiano (es. un italiano che vive nel Regno Unito con numero +44), prosegui in italiano; se poi cambia lingua, segui l'ultima usata. Correggi, sistema tono e forma, mantieni nomi, prezzi, numeri e link esatti. Per le offerte imposta language con la stessa lingua. Quando proponi o confermi un invio, mostra il testo esatto in lingua cliente e sotto una breve traduzione italiana tra parentesi. IDENTITÀ VERSO I CLIENTI: ogni testo destinato a un cliente (send_message, send_attachment, messaggi di offerta) lo scrivi come Bruno secondo il PERSONA CLIENTE qui sotto: prima chiama get_lead (contiene stage_rule e qualification) e search_knowledge_base per i fatti; segui la regola della fase del cliente; usa get_product_assets per foto/video/schede e send_attachment per inviarle; salva con update_qualification ogni dato nuovo emerso. Mai messaggi generici: personalizza con nome, esigenza, storico e fase. Dopo le azioni riassumi cosa hai fatto e con quale canale. Rispondi in italiano salvo richiesta diversa, in markdown conciso.
Data attuale: ${nowIso}.
PAUSA E INCARICHI: bruno_mode off/paused e bruno_paused_until sospendono esclusivamente le iniziative autonome. NON rifiutare un incarico esplicitamente richiesto dal team perché l'autonomia è in pausa: prepara la proposta e conserva l'approvazione prevista. Non modificare né azzerare la pausa, non riattivare l'autonomia. Restano validi i permessi, gli orari, le opposizioni del cliente e i limiti dei canali. La dicitura ai_generated indica la composizione del testo, NON un'autorizzazione autonoma. Per richieste su più clienti prepara proposte individuali verificabili, mai avvii in massa. Dichiara una proposta pronta solo se lo strumento ha restituito il suo identificativo; le chiamate proposte compaiono direttamente in chat.
CHIAMATE TELEFONICHE: Bruno può qualificare il cliente e consultare la knowledge base con voce inglese dal numero UK +447457416033. Prima cerca il cliente e i suoi dati, poi usa subito propose_call con lead_id, obiettivo e call_type (qualifica o trattativa). NON serve consenso documentato e NON chiedere mai il fuso orario: il sistema lo ricava dal prefisso del numero (+39 Italia, +44 UK, ecc.). Se più lead hanno lo stesso numero, preferisci quello non di test più recente o chiedi una sola volta quale usare. propose_call NON telefona: salva una proposta da approvare in Bruno → Chiamate. approve_call telefona davvero: usa solo quando l'operatore conferma esplicitamente una proposta specifica con call_id, mai nello stesso giro in cui l'hai proposta. In Telegram anche approve_call passa dai pulsanti di approvazione. PIANI OPERATIVI DI CHIAMATE: se il team chiede di chiamare PIÙ clienti (es. "chiama questi clienti", "qualifica i nuovi lead UK"), cerca i clienti, poi usa UNA sola volta propose_call_plan con tutti i lead_id in ordine di priorità (prima i più caldi/recenti), obiettivo e call_type. Nella risposta presenta il piano: elenco numerato clienti con motivo in breve, esclusi e perché, ritmo (una chiamata alla volta, pausa tra una e l'altra, solo 9-20 ora locale del cliente). Il team approva una sola volta con il pulsante Approva piano sotto la risposta; se chiede modifiche, prepara un NUOVO piano con propose_call_plan (il vecchio resta da annullare col pulsante). Dopo l'approvazione il sistema chiama in automatico in sequenza: non usare approve_call per le chiamate del piano. Per un solo cliente usa propose_call. Fuori da piani approvati nessuna chiamata automatica o in massa. Le risposte telefoniche sono in inglese; email/WhatsApp mantengono la lingua del cliente. Non dire che la chiamata è conclusa quando il servizio ha solo avviato lo squillo.
${instructions ? `Istruzioni del team: ${instructions}\n` : ''}Dati CRM (pipeline Vesuviano):
Lead per fase: ${JSON.stringify(counts)}

# PERSONA CLIENTE (solo per i testi ai clienti)
${customerPersona('any')}
${TOOL_MAP}
Attività scadute o di oggi: ${JSON.stringify(due ?? [])}
Lead più recenti: ${JSON.stringify(recent ?? [])}
In qualificato/trattativa: ${JSON.stringify(open ?? [])}`;

    // Approved proposals: run exactly the stored actions, no AI involved.
    if (execute?.length) {
      const lines: string[] = [];
      for (const a of execute) {
        if (!TOOL_LABELS[a.name]) { lines.push(`- ❌ ${a.name}: azione non ammessa`); continue; }
        try {
          if(!a.action_id) { lines.push('- Proposta non collegata al piano: prepara una nuova proposta prima di eseguire.'); continue; }
          const stored=await admin.from('bruno_actions').select('tool_name').eq('id',a.action_id).single();
          if(stored.error||stored.data?.tool_name!==a.name){lines.push('- Proposta non coerente: nessuna azione eseguita.');continue;}
          const r: any = await executeAction(ctx,a.action_id,executeTool);
          const state=r?.action_status;
          const icon=state==='completed'?'✅':state==='running'?'⏳':'⚠️';
          const description=state==='completed'?'conclusa':state==='running'?'in corso':state==='failed'?'non riuscita':state==='cancelled'?'annullata':'esito da verificare; non ripetere';
          lines.push(r?.error ? `- ⚠️ ${TOOL_LABELS[a.name]}: ${r.error}` : `- ${icon} ${TOOL_LABELS[a.name]} · ${description}${r?.public_url ? `\n  Link: ${r.public_url}\n  PDF: ${r.pdf_url}` : ''}${r?.sent_via ? `\n  Canale: ${r.sent_via}` : ''}${r?.proposal?.id ? `\n  Proposta chiamata: ${r.proposal.id}\n  Destinatario: ${r.proposal.destination}\n  Lingua: inglese. Nessuna chiamata ancora avviata. Conferma l'avvio o apri Bruno → Chiamate.` : ''}${a.name === 'approve_call' && state==='running' ? '\n  Squillo avviato, conversazione non ancora conclusa.' : ''}`);
        } catch (e) { lines.push(`- ❌ ${TOOL_LABELS[a.name]}: ${e instanceof Error ? e.message : 'errore'}`); }
      }
      return json({ text: lines.join('\n') });
    }
    const proposals: { name: string; args: Record<string, unknown>; action_id:string }[] = [];
    const proposedCalls: string[] = [];
    const proposedPlans: string[] = [];
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
          if (c.name === 'approve_call') {
            result = { error: 'La chiamata richiede approvazione esplicita dalla sezione Chiamate o dai pulsanti Telegram; nessuna chiamata eseguita.' };
            if (propose_writes) {
              const row=await saveAction(ctx,c.name,args);
              proposals.push({ name: row.tool_name, args:row.args, action_id:row.id });
              result = { status: 'Avvio chiamata proposto: in attesa di approvazione del team, NON eseguito' };
            }
            input.push({ type: 'function_call_output', call_id: c.call_id, output: JSON.stringify(result) });
            continue;
          }
          if (propose_writes && WRITE_TOOLS.includes(c.name) && c.name !== 'propose_call') {
            const row=await saveAction(ctx,c.name,args);
            proposals.push({ name: row.tool_name, args:row.args, action_id:row.id });
            result = { status: 'proposta registrata, in attesa di approvazione del team: NON è stata eseguita' };
            input.push({ type: 'function_call_output', call_id: c.call_id, output: JSON.stringify(result) });
            continue;
          }
          result = await runTool(ctx, c.name, args);
          if (c.name === 'propose_call' && result?.proposal?.id) proposedCalls.push(result.proposal.id);
          if (c.name === 'propose_call_plan' && result?.plan_id && result?.calls) proposedPlans.push(result.plan_id);
          if (TOOL_LABELS[c.name] && !result?.error) done.push(`${TOOL_LABELS[c.name]}${result?._link ? ` ([apri](${result._link}))` : ''}`);
        } catch (e) { result = { error: e instanceof Error ? e.message : 'Operazione non riuscita' }; console.error('tool', c.name, result.error); }
        input.push({ type: 'function_call_output', call_id: c.call_id, output: JSON.stringify(result).slice(0, 12000) });
      }
    }
    if (propose_writes) return json({ text: text || 'Ecco la proposta.', proposals, calls: proposedCalls, plans: proposedPlans });
    const final = (text || 'Fatto.') + (done.length ? `\n\n---\n**Azioni eseguite:**\n${done.map((d) => `- ✅ ${d}`).join('\n')}` : '');
    return new Response(final, { headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return new Response(null, { status: 499, headers: corsHeaders });
    console.error(e);
    return json({ error: 'Errore' }, 500);
  }
});
