import { useEffect, useRef, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { Bot, Mail, MessageCircle, Phone, Send, Sparkles, StickyNote, User, PauseCircle, PlayCircle, Loader2, AlertCircle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { BRUNO_OBJECTIVES, CHANNELS, brunoCanContact, isBrunoPaused, type BrunoChannel } from "@/lib/brunoObjectives";
import { CRM_STAGES } from "@/lib/crmPipeline";
import { cn } from "@/lib/utils";
import type { CRMLead } from "./CRMLeadCard";
import { mailErrorLabel } from "./MailboxSettings";
import { EmailSignatureSelector } from './EmailSignatures';
import { EmailPreview } from './EmailPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Msg {
  id: string; channel: BrunoChannel; direction: string; sender: string; subject: string | null;
  body: string; status: string; ai_generated: boolean; error: string | null; created_at: string;
  metadata?: { recording_url?: string | null; duration_seconds?: number } | null;
}
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
  const endRef = useRef<HTMLDivElement>(null);
  const emailOperation = useRef<{ key: string; draft: string; signatureId?: string | null } | null>(null);
  const [signature, setSignature] = useState('default');
  const [previewOpen, setPreviewOpen] = useState(false);
  const signatureId = signature === 'none' ? null : signature === 'default' ? undefined : signature;

  const load = async (id: string) => {
    const { data } = await supabase.from("crm_messages" as never).select("*").eq("lead_id", id).order("created_at");
    setMessages((data as unknown as Msg[]) || []);
  };

  useEffect(() => {
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
    return () => { supabase.removeChannel(ch); };
  }, [lead.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages.length]);

  const stage = lead.status || "nuovo";
  const objective = BRUNO_OBJECTIVES[stage] || BRUNO_OBJECTIVES.nuovo;
  const paused = isBrunoPaused(mode, pausedUntil);
  const name = lead.company_name || lead.contact_name || "Lead";

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
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {/* Intestazione cliente */}
      <div className="border-b p-4">
        <div className="flex flex-wrap items-center gap-2 break-words text-base font-semibold">
          {name}
          <Badge variant="secondary">{CRM_STAGES.find((x) => x.id === stage)?.title ?? stage}</Badge>
        </div>
        <span className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
          {lead.phone && <span>{lead.phone}</span>}{lead.email && <span>{lead.email}</span>}
          {!lead.phone && !lead.email && <span>Nessun contatto salvato</span>}
        </span>
      </div>

      {/* Pannello Bruno */}
      <div className="border-b bg-muted/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold"><Bot className="h-4 w-4 text-primary" />Bruno · {objective.goal}</p>
            <p className="text-xs text-muted-foreground">{objective.next}</p>
            {paused && <p className="mt-1 text-xs text-muted-foreground">
              In pausa{pausedUntil && mode !== "paused" ? ` fino al ${new Date(pausedUntil).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} (Gennaro ha scritto)` : ""}
            </p>}
          </div>
          <Button size="sm" variant="ghost" onClick={togglePause} aria-label={paused ? "Riattiva Bruno" : "Metti in pausa Bruno"}>
            {paused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
          </Button>
        </div>
        <Button size="sm" className="mt-3 w-full" onClick={suggest} disabled={thinking || paused || !brunoCanContact(stage)}>
          {thinking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {brunoCanContact(stage) ? "Suggerisci la prossima mossa" : "Lead perso: nessun follow-up"}
        </Button>
        {reasoning && <p className="mt-2 rounded-md bg-background p-2 text-xs text-muted-foreground">💡 {reasoning}</p>}
      </div>

      {/* Channel filter */}
      <div className="flex flex-wrap gap-1 border-b px-4 py-2" role="tablist" aria-label="Filtra per canale">
        {([["all", "Tutte"], ["whatsapp_api", "WhatsApp Bruno"], ["wasender", "WhatsApp Gennaro"], ["email", "Email"], ["call", "Chiamate"], ["note", "Note"]] as const).map(([k, label]) => {
          const count = k === "all" ? messages.length : messages.filter((m) => m.channel === k).length;
          return (
            <Button key={k} type="button" role="tab" aria-selected={viewFilter === k} size="sm"
              variant={viewFilter === k ? "default" : "outline"} className="h-7 px-2 text-xs"
              onClick={() => setViewFilter(k)}>
              {label} <span className="ml-1 opacity-70">{count}</span>
            </Button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4" aria-label="Comunicazioni">
        {visibleMessages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nessuna comunicazione registrata.</p>}
        {visibleMessages.map((m) => {
          const Icon = channelIcon[m.channel] ?? StickyNote;
          const out = m.direction !== "inbound";
          return (
            <div key={m.id} className={cn("flex", m.direction === "internal" ? "justify-center" : out ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] rounded-lg border p-3 text-sm",
                m.direction === "internal" ? "bg-accent/40" : out ? "bg-primary/10" : "bg-card")}>
                <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Icon className="h-3 w-3" />{CHANNELS[m.channel]?.short}
                  {m.ai_generated && <Badge variant="outline" className="h-4 px-1 text-[10px]">AI</Badge>}
                  <span>· {new Date(m.created_at).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                {m.subject && <p className="font-medium">{m.subject}</p>}
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                {m.channel === "call" && m.metadata?.recording_url?.startsWith("http") && (
                  <audio controls preload="none" src={m.metadata.recording_url} className="mt-2 h-8 w-full" aria-label="Registrazione chiamata" />
                )}
                {m.error && <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive"><AlertCircle className="h-3 w-3" />{m.error}</p>}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="space-y-2 border-t p-3">
        <ToggleGroup type="single" value={channel} onValueChange={(v) => v && setChannel(v as BrunoChannel)} className="flex-wrap justify-start" size="sm">
          {(["whatsapp_api", "wasender", "email", "note"] as const).map((c) => {
            const Icon = channelIcon[c];
            return <ToggleGroupItem key={c} value={c} className="text-xs"><Icon className="mr-1 h-3.5 w-3.5" />{CHANNELS[c].label}</ToggleGroupItem>;
          })}
        </ToggleGroup>
        {channel === "email" && <>
          <Input aria-label="Oggetto email" placeholder="Oggetto" value={subject} maxLength={300} disabled={sending} onChange={(e) => setSubject(e.target.value)} />
          <div className="flex flex-wrap items-center gap-2"><EmailSignatureSelector value={signature} onChange={setSignature} disabled={sending}/><Button variant="outline" size="sm" disabled={sending} onClick={() => setPreviewOpen(true)}><Eye className="mr-2 h-4 w-4"/>Anteprima</Button></div>
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}><DialogContent className="max-h-[90vh] w-[calc(100%-24px)] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>{subject || 'Vesuviano Forni'}</DialogTitle></DialogHeader><p className="break-words text-sm text-muted-foreground">A: {lead.email || 'Email cliente non disponibile'}</p><EmailPreview body={text} signatureId={signatureId}/></DialogContent></Dialog>
        </>}
        <div className="flex gap-2">
          <Textarea rows={3} value={text} onChange={(e) => { setText(e.target.value); }}
            placeholder={channel === "note" ? "Nota interna per il team…" : `Scrivi a ${name}…`} className="resize-none" />
          <Button onClick={send} disabled={sending || !text.trim()} className="self-end" aria-label="Invia">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
