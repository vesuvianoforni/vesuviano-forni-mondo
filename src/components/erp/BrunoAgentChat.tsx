import { useEffect, useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { BrunoPlanCard } from './BrunoPlanCard';
import { BrunoInlineCard } from "./BrunoInlineCard";
import type { LucideIcon } from "lucide-react";
import { Bot, CornerDownLeft, Loader2, SlidersHorizontal, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { BrunoThread, BrunoChatMessage } from "@/lib/brunoThreads";

const FN_BASE = "https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/";

const SUGGESTIONS = [
  "Chi devo ricontattare oggi?",
  "Riepilogo della pipeline e lead in trattativa",
  "Scrivi un WhatsApp di primo contatto per un nuovo lead UK",
  "Come rispondo a \"il prezzo è troppo alto\"?",
];

export interface AgentConfig { fn: string; name: string; description: string; suggestions: string[]; instructionsKey: string; icon: LucideIcon; placeholder?: string; onInstructions?: () => void; onComplete?: () => void; disabled?: boolean }

const BRUNO: AgentConfig = { fn: "bruno-chat", name: "Bruno", description: "Conosce Vesuviano e il tuo CRM. Chiedi priorità, bozze di email e WhatsApp, risposte alle obiezioni.", suggestions: SUGGESTIONS, instructionsKey: "bruno-agent-instructions", icon: Bot };

export function BrunoAgentChat({ thread, onChange, agent = BRUNO, conversationTail }: { thread: BrunoThread; onChange: (t: BrunoThread) => void; agent?: AgentConfig; conversationTail?: ReactNode }) {
  const INSTR_KEY = agent.instructionsKey; const FN_URL = FN_BASE + agent.fn; const Icon = agent.icon;
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instrOpen, setInstrOpen] = useState(false);
  const [instructions, setInstructions] = useState(() => localStorage.getItem(INSTR_KEY) || "");
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef(true);
  const mountedRef = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [thread.id, busy]);
  useEffect(() => { const timeline=timelineRef.current;if(timeline&&followingRef.current)timeline.scrollTop=timeline.scrollHeight; }, [thread.messages]);
  // Leaving the chat view must not kill a running request: the reply is still saved into the thread.
  useEffect(() => {mountedRef.current=true;return()=>{mountedRef.current=false}}, []);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy || agent.disabled) return;
    setError(null); setInput(""); setBusy(true);
    const history: BrunoChatMessage[] = [...thread.messages, { role: "user", content }];
    const title = thread.messages.length === 0 ? content.slice(0, 60) : thread.title;
    let current: BrunoThread = { ...thread, title, messages: [...history, { role: "assistant", content: "" }], updatedAt: new Date().toISOString() };
    onChange(current);
    const ctrl = new AbortController(); abortRef.current = ctrl;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if(ctrl.signal.aborted)return;
      const res = await fetch(FN_URL, {
        method: "POST", signal: ctrl.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ messages: history.filter(m => m.content.trim()).slice(-40).map(m => ({ ...m, content: m.content.slice(0, 8000) })), instructions: instructions || undefined, ...(agent.fn === 'mario-chat' ? { thread_id: thread.id } : {}) }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Errore ${res.status}`);
      }
      if(agent.fn==='bruno-chat'&&res.headers.get('content-type')?.includes('application/json')){
        const out=await res.json();
        if(ctrl.signal.aborted)return;
        const cards=[...(out.calls??[]).map((id:string)=>({kind:'call' as const,id})),...(out.proposals??[]).map((p:{action_id:string})=>({kind:'action' as const,id:p.action_id})),...(out.plans??[]).map((id:string)=>({kind:'plan' as const,id}))];
        current={...current,messages:[...history,{role:'assistant',content:out.text||'Ecco la proposta.',...(cards.length?{cards}:{})}]};onChange(current);return;
      }
      const reader = res.body.getReader(); const dec = new TextDecoder(); let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if(ctrl.signal.aborted)return;
        if (done) break;
        acc += dec.decode(value, { stream: true });
        current = { ...current, messages: [...history, { role: "assistant", content: acc }] };
        onChange(current);
      }
      if (!acc) throw new Error("Nessuna risposta dall'agente");
    } catch (e) {
      const last = current.messages[current.messages.length - 1];
      if (!last?.content) onChange({ ...current, messages: history });
      if(!mountedRef.current)return;
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally { if(mountedRef.current){setBusy(false);abortRef.current=null;if(!ctrl.signal.aborted)agent.onComplete?.();} }
  };

  const empty = thread.messages.length === 0;
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="flex shrink-0 justify-end p-3">
        <Button variant="outline" size="sm" onClick={() => agent.onInstructions ? agent.onInstructions() : setInstrOpen(true)}><SlidersHorizontal className="mr-2 h-4 w-4" />Istruisci l'agente</Button>
      </div>
      <div ref={timelineRef} onScroll={()=>{const t=timelineRef.current;if(t)followingRef.current=t.scrollHeight-t.scrollTop-t.clientHeight<96;}} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
        {empty ? (
          <div className="mx-auto flex max-w-2xl flex-col items-center pt-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-9 w-9" /></div>
            <h2 className="mt-4 text-2xl font-bold text-primary">{agent.name}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{agent.description}</p>
            <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
              {agent.suggestions.map((s) => (
                <Button key={s} type="button" variant="outline" disabled={agent.disabled} onClick={() => void send(s)} className="h-auto whitespace-normal rounded-lg p-4 text-left text-sm">{s}</Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-5 py-2">
            {thread.messages.map((m, i) => m.role === "user" ? (
              <div key={i} className="flex justify-end"><div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div></div>
            ) : (
              <div key={i} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                <div className="prose prose-sm min-w-0 max-w-none break-words text-foreground dark:prose-invert">
                  {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : busy && i === thread.messages.length - 1 ? <Loader2 className="mt-1 h-4 w-4 animate-spin text-muted-foreground" /> : <p className="text-muted-foreground">Risposta interrotta: riscrivi la richiesta.</p>}
                  {m.cards?.map(c => c.kind === 'plan' ? <BrunoPlanCard key={c.kind + c.id} id={c.id} /> : <BrunoInlineCard key={c.kind + c.id} kind={c.kind} id={c.id} />)}
                </div>
              </div>
            ))}
            <div ref={endRef} />
            {conversationTail && <div className={busy ? "hidden" : "min-w-0 border-t pt-4"} aria-label="Proposta di Mario">{conversationTail}</div>}
          </div>
        )}
        {empty && conversationTail && <div className="mx-auto max-w-3xl py-4" aria-label="Proposta di Mario">{conversationTail}</div>}
      </div>
      {error && <p className="mx-4 mb-2 text-sm text-destructive">{error}</p>}
      <form className="m-4 mt-2 shrink-0 rounded-xl border border-primary/40 bg-card focus-within:border-primary" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
        <Textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Chiedi all'agente…" aria-label={`Messaggio per ${agent.name}`}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
          className="min-h-[72px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0" />
        <div className="flex justify-end border-t p-2">
          {busy
            ? <Button type="button" size="icon" className="h-9 w-9 rounded-full" aria-label="Interrompi" onClick={() => abortRef.current?.abort()}><Square className="h-4 w-4" /></Button>
            : <Button type="submit" size="icon" className="h-9 w-9 rounded-full" aria-label="Invia" disabled={!input.trim() || agent.disabled}><CornerDownLeft className="h-4 w-4" /></Button>}
        </div>
      </form>
      <Dialog open={instrOpen} onOpenChange={setInstrOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Istruisci {agent.name}</DialogTitle></DialogHeader>
          <Textarea rows={8} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Es. dai priorità ai lead UK, tono sempre informale…" />
          <DialogFooter><Button onClick={() => { localStorage.setItem(INSTR_KEY, instructions); setInstrOpen(false); }}>Salva</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
