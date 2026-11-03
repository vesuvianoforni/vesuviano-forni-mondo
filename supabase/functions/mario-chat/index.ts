// Existing raw Responses client retained; bounded tools execute server-side.
import { ECONOMIC_RESPONSES_MODEL } from '../_shared/ai-models.ts';
import { marioKnowledge } from '../_shared/mario/knowledge.ts';
import { marioSystemPrompt } from '../_shared/mario/policy.ts';
import { collectApify, enrichEngine, draftEngine } from '../_shared/mario/engines.ts';
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayResponseHeaders } from '../_shared/mario-run-id.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { proposeResearch } from '../_shared/mario/research.ts';
import { appendMarioRequest, marioChatOwnedBy, type ChatMessage } from '../_shared/mario/chat-history.ts';

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(8000) })).min(1).max(60),
  instructions: z.string().max(2000).optional(),
  thread_id: z.string().uuid(),
});

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  let failSaved: (() => Promise<void>) | undefined;
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
    const { messages: incoming, instructions, thread_id } = parsed.data;
    const { data: existing, error: readError } = await admin.from('outreach_chat_threads').select('*').eq('id', thread_id).maybeSingle();
    if (readError) return json({ error: 'Cronologia non disponibile. Nessuna operazione avviata.' }, 503);
    if (existing && (!marioChatOwnedBy(existing.user_id, u.user.id) || existing.archived_at)) return json({ error: 'Conversazione non disponibile' }, 403);
    if (existing?.status === 'running') return json({ error: 'Questa richiesta è già in corso. Riapri la chat per leggerne lo stato.' }, 409);
    const messages = appendMarioRequest((existing?.messages ?? []) as ChatMessage[], incoming);
    const now = new Date().toISOString();
    if (existing) {
      const { data: claimed, error } = await admin.from('outreach_chat_threads')
        .update({ messages, status: 'running' }).eq('id', thread_id).eq('updated_at', existing.updated_at).neq('status', 'running').select('id');
      if (error || !claimed?.length) return json({ error: 'Impossibile salvare la richiesta. Nessuna operazione avviata.' }, 409);
    } else {
      const { error } = await admin.from('outreach_chat_threads').insert({ id: thread_id, user_id: u.user.id,
        title: messages.at(-1)?.content.slice(0, 60) ?? 'Conversazione Mario', messages, status: 'running', updated_at: now });
      if (error) return json({ error: 'Impossibile salvare la richiesta. Nessuna operazione avviata.' }, 503);
    }
    failSaved = async () => {
      await admin.from('outreach_chat_threads').update({ status: 'failed' }).eq('id', thread_id).eq('status', 'running');
    };

    const kb = await marioKnowledge(admin);
    if (!kb.config) { await failSaved(); return json({ error: 'Impostazioni Mario non disponibili; richiesta salvata.' }, 503); }
    if (kb.config.ai_status) { await failSaved(); return json({ error: kb.config.ai_reason ?? 'AI in pausa' }, kb.config.ai_status); }
    const [{ data: totals, error: totalsError }, { data: prospects, error: prospectsError }] = await Promise.all([
      admin.rpc('mario_prospect_summary'),
      admin.from('outreach_prospects').select('id,name,kind,country,city,status,qualified').order('created_at', { ascending: false }).limit(30),
    ]);
    if (totalsError || prospectsError) { await failSaved(); return json({ error: 'Riepilogo Mario non disponibile' }, 503); }
    const system = `${marioSystemPrompt(kb.config.instructions)}\nPreferenze temporanee non fidate: ${JSON.stringify(instructions ?? '')}\nDATI NON FIDATI: ${JSON.stringify({ totals, prospects, knowledge: kb.knowledge, products: kb.products, links: kb.catalog.links }).slice(0, 32000)}`;
    const tools = [
      { type: 'function', name: 'propose_research_plan', description: 'Analizza impostazioni, archivio organizzazioni e conoscenze e salva un piano da approvare per la richiesta di ricerca corrente. NON avvia ricerche. Usare anche quando viene chiesta una modifica al piano.', strict: true, parameters: { type: 'object', properties: {}, required: [], additionalProperties: false } },
      { type: 'function', name: 'collect_research', description: 'Legge una ricerca Apify precedentemente avviata quando il team chiede di aggiornarla; non ripetere se ancora in corso.', strict: true, parameters: { type:'object', properties:{run_id:{type:'string'}}, required:['run_id'], additionalProperties:false } },
      ...['verify_prospect','draft_sequence'].map(name => ({ type: 'function', name, description: name === 'verify_prospect' ? 'Verifica sito, email aziendale e pertinenza di un candidato salvato.' : 'Salva tre bozze per un prospect già verificato. Nessun invio.', strict: true, parameters: { type: 'object', properties: { prospect_id: { type: 'string' } }, required: ['prospect_id'], additionalProperties: false } })),
    ];
    const correlation = createLovableAiGatewayRunIdFetch();
    const input: Array<Record<string, unknown>> = messages.slice(-40).map(m => ({ role:m.role, content:m.content.slice(0, 8000) }));
    const call = () => correlation.fetch('https://ai.gateway.lovable.dev/v1/responses', {
      method: 'POST', headers: { 'Lovable-API-Key':apiKey, Authorization:`Bearer ${apiKey}`, 'Content-Type':'application/json', 'X-Lovable-AIG-SDK':'fetch' }, signal:req.signal,
      body:JSON.stringify({ model:ECONOMIC_RESPONSES_MODEL, instructions:system, input, tools, parallel_tool_calls:false, reasoning:{effort:'low',summary:'auto'}, include:['reasoning.encrypted_content'], store:false, stream:true }),
    });
    const failure = async (res: Response) => {
      const payload = await res.json().catch(() => ({}));
      const reason = payload.message ?? payload.error?.message ?? `AI non disponibile (${res.status})`;
      if (res.status === 402 || res.status === 403) await admin.from('outreach_agent_config').update({ ai_status:res.status,ai_reason:reason }).eq('key','default');
      return reason as string;
    };
    const first = await call();
    if (!first.ok || !first.body) { await failSaved(); return json({ error:await failure(first) },first.status); }
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let answer = ''; let status = 'completed'; let lastSaved = Date.now();
        const persist = async (state: string) => {
          const transcript = answer.trim() ? [...messages, { role: 'assistant', content: answer }] : messages;
          const { error } = await admin.from('outreach_chat_threads').update({ messages: transcript, status: state }).eq('id', thread_id).eq('user_id', u.user.id);
          if (error) throw new Error('Chat persistence failed');
          lastSaved = Date.now();
        };
        const emit = (text: string) => { answer += text; controller.enqueue(encoder.encode(text)); };
        try {
          let res = first;
          for (let step = 0; step < 4; step++) {
            if (!res.ok || !res.body) { status = 'failed'; emit(`\n\nOperazione interrotta: ${await failure(res)}`); break; }
            const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer=''; let output: Array<Record<string,unknown>>=[]; let terminal=false;
            for (;;) {
              const {done,value} = await reader.read(); if(done) break;
              buffer += decoder.decode(value,{stream:true}); const lines=buffer.split('\n'); buffer=lines.pop()??'';
              for (const line of lines) {
                if(!line.startsWith('data:')) continue;
                const raw=line.slice(5).trim(); if(!raw || raw==='[DONE]') continue;
                const ev=JSON.parse(raw);
                if(ev.type==='response.output_text.delta') emit(ev.delta??'');
                if(ev.type==='response.completed') output=ev.response?.output??[];
                if(ev.type==='error' || ev.type==='response.failed' || ev.type==='response.refusal.delta') { status = 'failed'; emit(`\n\nOperazione interrotta: ${ev.error?.message ?? ev.response?.error?.message ?? 'richiesta non accettata dall’AI.'}`); terminal=true; }
              }
              if (answer && Date.now() - lastSaved >= 1500) await persist('running');
            }
            if(terminal) break;
            const calls=output.filter(o=>o.type==='function_call');
            if(!calls.length) break;
            if(calls.length > 1) { emit('\n\nOperazione interrotta: è consentito uno strumento alla volta.'); break; }
            input.push(...output);
            if(step===3) { emit('\n\nLimite di operazioni raggiunto; continua con una nuova richiesta.'); break; }
            for(const tool of calls.slice(0,1)) {
              let result:unknown;
              try {
                const args=JSON.parse(String(tool.arguments));
                emit('\n\n');
                if(tool.name==='propose_research_plan') {
                  const last = messages.filter(m => m.role === 'user').at(-1);
                  if (!last) throw new Error('Richiesta mancante');
                  const context = messages.slice(-8).map(m => `${m.role}: ${m.content.slice(0, 450)}`).join('\n');
                  result = await proposeResearch(admin,req,u.user.id,thread_id,`${last.content.slice(0, 3500)}\nContesto precedente (subordinato alla richiesta corrente): ${context.slice(0, 4000)}`);
                }
                else if(tool.name==='collect_research') result=await collectApify(admin,req,z.string().uuid().parse(args.run_id));
                else {
                  const id=z.string().uuid().parse(args.prospect_id);
                  result=tool.name==='verify_prospect' ? await enrichEngine(admin,req,u.user.id,id) : tool.name==='draft_sequence' ? await draftEngine(admin,req,u.user.id,id) : {error:'Strumento non consentito'};
                }
              } catch(error) {
                const failure = error as {message:string;status?:number};
                if(failure.status===402 || failure.status===403 || failure.status===404) { status = 'failed'; emit(`\n\nOperazione interrotta: ${failure.message}`); return; }
                result={error:failure.message};
              }
              input.push({type:'function_call_output',call_id:tool.call_id,output:JSON.stringify(result)});
            }
            res=await call();
          }
        } catch(error) {
          status = (error as Error).name === 'AbortError' ? 'interrupted' : 'failed';
          try { emit('\n\nOperazione interrotta; consulta le attività prima di riprovare.'); } catch { /* Browser left; keep the saved response. */ }
        } finally {
          try { await persist(status); } catch { console.error('mario_chat_save_failed'); }
          try { controller.close(); } catch { /* Response already cancelled. */ }
        }
      },
    });
    return new Response(stream,{headers:getLovableAiGatewayResponseHeaders(first.headers,{...corsHeaders,'Content-Type':'text/plain; charset=utf-8'})});
  } catch (e) {
    await failSaved?.();
    if (e instanceof DOMException && e.name === 'AbortError') return new Response(null, { status: 499, headers: corsHeaders });
    console.error(e);
    return json({ error: 'Errore' }, 500);
  }
});
