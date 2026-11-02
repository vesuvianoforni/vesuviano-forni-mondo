import { useEffect, useRef, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { Bot, Mail, MessageCircle, Phone, Send, Sparkles, StickyNote, PauseCircle, PlayCircle, Loader2, Eye, ArrowDown, UserRound, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BRUNO_OBJECTIVES, CHANNELS, brunoCanContact, isBrunoPaused, type BrunoChannel } from "@/lib/brunoObjectives";
import { CRM_STAGES } from "@/lib/crmPipeline";
import { cn } from "@/lib/utils";
import type { CRMLead } from "./CRMLeadCard";
import { mailErrorLabel } from "./MailboxSettings";
import { EmailSignatureSelector } from './EmailSignatures';
import { EmailPreview } from './EmailPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BrunoMessage, type BrunoMessageData } from "./BrunoMessage";

type Msg = BrunoMessageData;
export type BrunoLead = CRMLead & { bruno_mode?: string; bruno_paused_until?: string | null };

const channelIcon = { whatsapp_api: Bot, wasender: MessageCircle, email: Mail, note: StickyNote, call: Phone };

async function invoke(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("bruno-agent", { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try { const j = await error.context.json(); msg = j.message?.error || j.error || msg; } catch { /* ignore */ }
    }
    throw new Error(typeof msg === "string" ? msg : "Errore");
  }
  return data;
}

/** Timeline, suggerimenti e composer di Bruno. Usato nel pannello lead e nella sezione Bruno. */
export function BrunoPanel({ lead, className, onUpdated }: { lead: BrunoLead; className?: string; onUpdated?: () => void }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [channel, setChannel] = useState<BrunoChannel>("whatsapp_api");
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [aiDraft, setAiDraft] = useState(false);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [mode, setMode] = useState("draft");
  const [pausedUntil, setPausedUntil] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<"all" | BrunoChannel>("all");
  const visibleMessages = viewFilter === "all" ? messages : messages.filter((m) => m.channel === viewFilter);
  const timelineRef = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const previousView = useRef("");
  const activeLeadId = useRef(lead.id);
  const loadRequest = useRef(0);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [awayFromLatest, setAwayFromLatest] = useState(false);
  const emailOperation = useRef<{ key: string; draft: string; signatureId?: string | null } | null>(null);
  const [signature, setSignature] = useState('default');
  const [previewOpen, setPreviewOpen] = useState(false);
  const signatureId = signature === 'none' ? null : signature === 'default' ? undefined : signature;

  const load = async (id: string) => {
    if (id !== activeLeadId.current) return;
    const request = ++loadRequest.current;
    try {
      const data: Msg[] = [];
      for (let from = 0; ; from += 1000) {
        const { data: batch, error } = await supabase.from("crm_messages").select("*").eq("lead_id", id).order("created_at").order("id").range(from, from + 999);
        if (error) throw error;
        if (request !== loadRequest.current || id !== activeLeadId.current) return;
        data.push(...((batch ?? []) as unknown as Msg[]));
        if (!batch || batch.length < 1000) break;
      }
      setMessages(data);
      setMessagesError(null);
    } catch {
      if (request === loadRequest.current && id === activeLeadId.current) setMessagesError("Impossibile caricare le comunicazioni.");
    } finally {
      if (request === loadRequest.current && id === activeLeadId.current) setMessagesLoading(false);
    }
  };

  useEffect(() => {
    activeLeadId.current = lead.id;
    setMessages([]); setMessagesLoading(true); setMessagesError(null); setViewFilter("all");
    followLatest.current = true; setAwayFromLatest(false);
    setText(""); setSubject(""); setReasoning(null); setAiDraft(false);
    setSignature('default'); setPreviewOpen(false);
    emailOperation.current=null;
    try {
      const saved=sessionStorage.getItem(`crm-email-operation:${lead.id}`);
      if(saved){const operation=JSON.parse(saved);if(typeof operation.key==='string'&&typeof operation.draft==='string')emailOperation.current=operation;}
    } catch { /* storage is optional; server still owns delivery idempotency */ }
    setMode(lead.bruno_mode || "draft"); setPausedUntil(lead.bruno_paused_until ?? null);
    load(lead.id);
    const ch = supabase.channel(`crm-msg-${lead.id}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "crm_messages", filter: `lead_id=eq.${lead.id}` }, () => load(lead.id))
      .subscribe();
    return () => { loadRequest.current += 1; supabase.removeChannel(ch); };
  }, [lead.id]);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    const view = `${lead.id}:${viewFilter}`;
    if (view !== previousView.current) {
      followLatest.current = true;
      previousView.current = view;
    }
    if (followLatest.current) {
      timeline.scrollTop = timeline.scrollHeight;
      setAwayFromLatest(false);
    }
  }, [messages, viewFilter, lead.id]);

  const scrollToLatest = () => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    followLatest.current = true;
    timeline.scrollTop = timeline.scrollHeight;
    setAwayFromLatest(false);
  };

  const stage = lead.status || "nuovo";
  const objective = BRUNO_OBJECTIVES[stage] || BRUNO_OBJECTIVES.nuovo;
  const paused = isBrunoPaused(mode, pausedUntil);
  const name = lead.company_name || lead.contact_name || "Lead";
  const ComposeIcon = channelIcon[channel];
  const destination = channel === "note" ? "Visibile solo al team" : channel === "email" ? lead.email || "Email non presente" : lead.phone || "Telefono non presente";

  const suggest = async () => {
    setThinking(true);
    try {
      const { suggestion } = await invoke({ action: "suggest", lead_id: lead.id });
      if (suggestion?.channel && suggestion.channel in CHANNELS) setChannel(suggestion.channel);
      setText(suggestion?.message || ""); setSubject(suggestion?.subject || "");
      setReasoning(suggestion?.reasoning || null); setAiDraft(true);
    } catch (e) {
      toast({ title: "Bruno non ha risposto", description: (e as Error).message, variant: "destructive" });
    } finally { setThinking(false); }
  };

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const draft = JSON.stringify([lead.id, subject || 'Vesuviano Forni', text.trim()]);
      if (channel === 'email' && emailOperation.current?.draft !== draft) emailOperation.current = { key: crypto.randomUUID(), draft, signatureId };
      if(channel==='email'&&emailOperation.current){try {sessionStorage.setItem(`crm-email-operation:${lead.id}`,JSON.stringify(emailOperation.current));}catch{/* optional storage */}}
      const result = await invoke({ action: "send", lead_id: lead.id, channel, body: text.trim(), subject: channel === "email" ? subject || undefined : undefined, ai_generated: aiDraft,
        ...(channel === 'email' ? { idempotency_key: emailOperation.current?.key, signature_id: emailOperation.current?.signatureId } : {}) });
      toast({ title: channel === "note" ? "Nota salvata" : "Messaggio inviato",
        description: channel === 'email' && !['found','appended'].includes(result.copy_status) ? 'Email accettata dal server; copia in Posta inviata da verificare. Non verrà reinviata.' : undefined });
      emailOperation.current = null;
      if(channel==='email'){try {sessionStorage.removeItem(`crm-email-operation:${lead.id}`);}catch{/* optional storage */}}
      setText(""); setSubject(""); setReasoning(null); setAiDraft(false);
      followLatest.current = true;
      if (channel === "wasender" && !aiDraft) setPausedUntil(new Date(Date.now() + 48 * 3600e3).toISOString());
    } catch (e) {
      toast({ title: "Invio non riuscito", description: mailErrorLabel((e as Error).message), variant: "destructive" });
    } finally { setSending(false); load(lead.id); }
  };

  const togglePause = async () => {
    const next = paused ? "draft" : "paused";
    const patch = { bruno_mode: next, bruno_paused_until: null };
    const { error } = await supabase.from("leads").update(patch as never).eq("id", lead.id);
    if (error) return toast({ title: "Errore", description: error.message, variant: "destructive" });
    setMode(next); setPausedUntil(null);
    onUpdated?.();
  };

  return (
    <div className={cn("bruno-workspace flex min-h-0 min-w-0 flex-1 overflow-hidden flex-col bg-background text-foreground", className)}>
      {/* Intestazione cliente */}
      <div className="flex shrink-0 items-start justify-between gap-3 border-b p-3 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 break-words text-base font-semibold">
            {name}
            <Badge variant="outline" className="bg-muted font-normal text-muted-foreground">{CRM_STAGES.find((x) => x.id === stage)?.title ?? stage}</Badge>
          </div>
          <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground [overflow-wrap:anywhere]">
            {lead.phone && <a className="inline-flex items-center gap-1.5 hover:text-foreground" href={`tel:${lead.phone}`}><Phone className="h-3 w-3 shrink-0" />{lead.phone}</a>}
            {lead.email && <a className="inline-flex min-w-0 items-center gap-1.5 hover:text-foreground" href={`mailto:${lead.email}`}><Mail className="h-3 w-3 shrink-0" />{lead.email}</a>}
            {!lead.phone && !lead.email && <span>Nessun contatto salvato</span>}
          </span>
        </div>
        <Tooltip><TooltipTrigger asChild><Button asChild size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label="Apri scheda cliente"><Link to={`/erp/crm?lead=${encodeURIComponent(lead.id)}`}><UserRound className="h-4 w-4" /></Link></Button></TooltipTrigger><TooltipContent>Apri scheda cliente</TooltipContent></Tooltip>
      </div>

      {/* Pannello Bruno */}
      <div className="shrink-0 border-b bg-muted/50 p-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold"><Bot className="h-4 w-4 text-primary" />Bruno · {objective.goal}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{objective.next}</p>
            {paused && <p className="mt-1 text-xs text-muted-foreground">
              In pausa{pausedUntil && mode !== "paused" ? ` fino al ${new Date(pausedUntil).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} (Gennaro ha scritto)` : ""}
            </p>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
          <Button size="sm" variant="outline" className="h-8 gap-2" onClick={suggest} disabled={thinking || paused || !brunoCanContact(stage)}>
            {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
            {brunoCanContact(stage) ? "Suggerisci risposta" : "Nessun follow-up"}
          </Button>
          <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" onClick={togglePause} aria-label={paused ? "Riattiva Bruno" : "Metti in pausa Bruno"}>
            {paused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
          </Button></TooltipTrigger><TooltipContent>{paused ? "Riattiva Bruno" : "Metti in pausa Bruno"}</TooltipContent></Tooltip>
          </div>
        </div>
        {reasoning && <p className="mt-2 border-l-2 border-primary pl-3 text-xs leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{reasoning}</p>}
      </div>

      {/* Channel filter */}
      <div className="flex shrink-0 flex-wrap gap-1 border-b px-3 py-2 sm:px-5" role="tablist" aria-label="Filtra per canale">
        {([["all", "Tutte"], ["whatsapp_api", "WhatsApp Bruno"], ["wasender", "WhatsApp Gennaro"], ["email", "Email"], ["call", "Chiamate"], ["note", "Note"]] as const).map(([k, label]) => {
          const count = k === "all" ? messages.length : messages.filter((m) => m.channel === k).length;
          const Icon = k === "all" ? null : channelIcon[k];
          return (
            <Button key={k} type="button" role="tab" aria-selected={viewFilter === k} size="sm"
              variant="ghost" className={cn("h-8 gap-1.5 px-2 text-xs hover:bg-muted hover:text-foreground", viewFilter === k && "bg-accent font-semibold text-accent-foreground")}
              onClick={() => setViewFilter(k)}>
              {Icon && <Icon className="h-3.5 w-3.5" />}{label} <span className="min-w-4 text-[10px] text-muted-foreground">{messagesLoading ? "…" : count}</span>
            </Button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-muted/60">
      <div ref={timelineRef} className="min-h-0 min-w-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto overscroll-contain px-3 pb-4 sm:px-5" aria-label="Comunicazioni" aria-busy={messagesLoading}
        onScroll={() => {
          const timeline = timelineRef.current;
          if (!timeline) return;
          const nearBottom = timeline.scrollHeight - timeline.scrollTop - timeline.clientHeight < 80;
          followLatest.current = nearBottom;
          setAwayFromLatest(!nearBottom);
        }}>
        {messagesLoading && <p role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Caricamento comunicazioni…</p>}
        {messagesError && <div role="alert" className="py-6 text-center text-sm text-destructive"><p>{messagesError}</p><Button variant="outline" size="sm" className="mt-2" onClick={() => { setMessagesLoading(true); void load(lead.id); }}>Riprova</Button></div>}
        {!messagesLoading && !messagesError && visibleMessages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nessuna comunicazione registrata.</p>}
        {visibleMessages.map((m, index) => <BrunoMessage key={m.id} message={m} customerName={lead.contact_name || name} showDate={index === 0 || new Date(visibleMessages[index - 1].created_at).toDateString() !== new Date(m.created_at).toDateString()} />)}
      </div>
      {awayFromLatest && !messagesLoading && <Button type="button" size="icon" variant="secondary" className="absolute bottom-3 right-5 h-9 w-9 rounded-full" title="Vai agli ultimi messaggi" aria-label="Vai agli ultimi messaggi" onClick={scrollToLatest}><ArrowDown className="h-4 w-4" /></Button>}
      </div>

      {/* Composer */}
      <div className="shrink-0 space-y-2 border-t bg-background p-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs text-muted-foreground">Invia tramite</span>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" disabled={sending} aria-label="Scegli canale di invio" className="h-8 gap-2 border-primary/30 text-xs font-semibold text-primary hover:bg-accent hover:text-accent-foreground"><ComposeIcon className="h-4 w-4" />{CHANNELS[channel].label}<ChevronDown className="h-3 w-3" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="start"><DropdownMenuRadioGroup value={channel} onValueChange={(value) => { if (value in CHANNELS && value !== "call") setChannel(value as BrunoChannel); }}>
              {(["whatsapp_api", "wasender", "email", "note"] as const).map((c) => { const Icon = channelIcon[c]; return <DropdownMenuRadioItem key={c} value={c}><Icon className="mr-2 h-4 w-4" />{CHANNELS[c].label}</DropdownMenuRadioItem>; })}
            </DropdownMenuRadioGroup></DropdownMenuContent>
          </DropdownMenu>
          <span className="min-w-0 break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">{destination}</span>
          {aiDraft && <Badge variant="outline" className="text-[10px]">Bozza di Bruno</Badge>}
        </div>
        {channel === "email" && <>
          <Input aria-label="Oggetto email" placeholder="Oggetto" value={subject} maxLength={300} disabled={sending} onChange={(e) => setSubject(e.target.value)} />
          <div className="flex flex-wrap items-center gap-2"><EmailSignatureSelector value={signature} onChange={setSignature} disabled={sending}/><Button variant="outline" size="sm" disabled={sending} onClick={() => setPreviewOpen(true)}><Eye className="mr-2 h-4 w-4"/>Anteprima</Button></div>
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}><DialogContent className="max-h-[90vh] w-[calc(100%-24px)] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>{subject || 'Vesuviano Forni'}</DialogTitle></DialogHeader><p className="break-words text-sm text-muted-foreground">A: {lead.email || 'Email cliente non disponibile'}</p><EmailPreview body={text} signatureId={signatureId}/></DialogContent></Dialog>
        </>}
        <div className="flex min-w-0 gap-2">
          <Textarea aria-label="Messaggio" rows={2} value={text} disabled={sending} onChange={(e) => { setText(e.target.value); }}
            placeholder={channel === "note" ? "Nota interna per il team…" : `Scrivi a ${name}…`} className="min-h-[76px] min-w-0 resize-none text-sm" />
          <Tooltip><TooltipTrigger asChild><Button size="icon" onClick={send} disabled={sending || !text.trim()} className="h-10 w-10 shrink-0 self-end" aria-label={channel === "note" ? "Salva nota" : "Invia"}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : channel === "note" ? <StickyNote className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button></TooltipTrigger><TooltipContent>{channel === "note" ? "Salva nota interna" : `Invia tramite ${CHANNELS[channel].label}`}</TooltipContent></Tooltip>
        </div>
      </div>
    </div>
  );
}
