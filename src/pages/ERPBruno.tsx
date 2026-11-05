import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot, PauseCircle, Search, Loader2, ChevronLeft, MessageSquare, MessageSquarePlus, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { BrunoAgentChat } from "@/components/erp/BrunoAgentChat";
import { loadThreads, newThread, saveThreads, type BrunoThread } from "@/lib/brunoThreads";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCRMInteractions } from "@/hooks/useCRMInteractions";
import { CRM_STAGES } from "@/lib/crmPipeline";
import { CHANNELS, isBrunoPaused } from "@/lib/brunoObjectives";
import { brunoQueueReason, type BrunoQueueReason } from "@/lib/brunoQueue";
import { BrunoPanel, type BrunoLead } from "@/components/erp/BrunoPanel";
import { cn } from "@/lib/utils";
import { MailboxSettings } from "@/components/erp/MailboxSettings";
import { TelegramLink } from "@/components/erp/TelegramLink";
import { BrunoKnowledge } from "@/components/erp/BrunoKnowledge";
import { BrunoVoice } from "@/components/erp/BrunoVoice";
import { Switch } from "@/components/ui/switch";
import { interactionRelativeTime } from "@/lib/crmActivity";

const PAGE = 1000;

interface Summary { count: number; lastAt: string; lastContactAt: string | null; preview: string; channel: string; }

export default function ERPBruno() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<BrunoLead[]>([]);
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const pipeline = "Vesuviano";
  const [stageFilter, setStageFilter] = useState("all");
  const [onlyQueue, setOnlyQueue] = useState(false);
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("lead");
  const setSelectedId = (id: string | null) => setParams((p) => { const n = new URLSearchParams(p); if (id) { n.set("lead", id); } else n.delete("lead"); return n; });
  const [threads, setThreads] = useState<BrunoThread[]>(() => { const t = loadThreads(); if (t.length) return t; const first = [newThread()]; saveThreads(first); return first; });
  const activeThread = threads.find((t) => t.id === params.get("chat")) ?? threads[0];
  const openThread = (id: string) => setParams(() => new URLSearchParams({ chat: id }));
  const updateThread = useCallback((t: BrunoThread) => setThreads((prev) => { const next = [t, ...prev.filter((x) => x.id !== t.id)]; saveThreads(next); return next; }), []);
  const createThread = () => { const t = newThread(); setThreads((prev) => { const next = [t, ...prev]; saveThreads(next); return next; }); openThread(t.id); };
  const deleteThread = (id: string) => setThreads((prev) => { let next = prev.filter((x) => x.id !== id); if (!next.length) next = [newThread()]; saveThreads(next); return next; });
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async () => {
    try {
      const all: BrunoLead[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).order("id").range(from, from + PAGE - 1);
        if (error) throw error;
        all.push(...(data ?? []));
        if (!data || data.length < PAGE) break;
      }
      const map: Record<string, Summary> = {};
      for (let from = 0; from < all.length; from += 500) {
        const { data, error } = await supabase.rpc("bruno_message_summaries", { p_lead_ids: all.slice(from, from + 500).map(lead => lead.id) });
        if (error) throw error;
        for (const summary of data ?? []) map[summary.lead_id] = {
          count: Number(summary.message_count), lastAt: summary.last_at, lastContactAt: summary.last_contact_at,
          preview: summary.preview, channel: summary.last_channel,
        };
      }
      setLeads(all);
      setSummaries(map);
    } catch (error) {
      toast({ title: "Errore", description: (error as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const { interactions } = useCRMInteractions(leads, { includeMessages: false });

  const rows = useMemo(() => leads
    .filter((lead) => !pipeline || lead.pipeline === pipeline)
    .map((lead) => {
      const summary = summaries[lead.id];
      const siteAt = interactions[lead.id]?.at ?? null;
      const lastContactAt = [siteAt, summary?.lastContactAt].filter(Boolean)
        .sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime())[0] ?? null;
      return {
        lead,
        summary,
        lastContactAt,
        paused: isBrunoPaused(lead.bruno_mode, lead.bruno_paused_until, now),
        reason: brunoQueueReason({
          stage: lead.status, brunoMode: lead.bruno_mode, brunoPausedUntil: lead.bruno_paused_until,
          lastContactAt, nextActivityAt: lead.next_activity_date, createdAt: lead.created_at, now,
        }) as BrunoQueueReason | null,
      };
    })
    .filter((row) => (stageFilter === "all" ? true : row.lead.status === stageFilter)
      && (!onlyQueue || row.reason !== null)
      && `${row.lead.company_name || ""} ${row.lead.contact_name || ""} ${row.lead.email || ""} ${row.lead.phone || ""}`
        .toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const rank = (r: BrunoQueueReason | null) => (r ? (r.severity === "overdue" ? 0 : 1) : 2);
      if (onlyQueue) { const delta = rank(a.reason) - rank(b.reason); if (delta !== 0) return delta; }
      const left = a.summary?.lastAt || a.lastContactAt || a.lead.created_at;
      const right = b.summary?.lastAt || b.lastContactAt || b.lead.created_at;
      return new Date(right).getTime() - new Date(left).getTime();
    }), [leads, summaries, interactions, pipeline, stageFilter, onlyQueue, search, now]);

  const selected = rows.find((row) => row.lead.id === selectedId)?.lead ?? leads.find((lead) => lead.id === selectedId) ?? null;
  const queued = rows.filter((row) => row.reason).length;
  const pausedCount = rows.filter((row) => row.paused).length;

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="bruno-workspace flex h-[calc(100dvh-3.5rem)] min-h-0 min-w-0 w-full overflow-hidden flex-col bg-background text-foreground">
      <div className={cn("flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3", selected && "hidden md:flex")}>
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-semibold"><Bot className="h-5 w-5 text-primary" />Bruno <span className="text-sm font-normal text-muted-foreground">Sales & Back-office</span></h1>
          <p className="mt-0.5 text-xs text-muted-foreground">{queued} clienti da contattare · {pausedCount} in pausa</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-medium"><Switch checked={onlyQueue} onCheckedChange={setOnlyQueue} aria-label="Solo in coda" />Solo in coda</label>
          <BrunoKnowledge />
          <BrunoVoice />
          <TelegramLink />
          <MailboxSettings />
        </div>
      </div>

      <div className="grid min-h-0 min-w-0 flex-1 overflow-hidden md:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className={cn("flex min-h-0 min-w-0 flex-col overflow-hidden border-r", selected && "hidden md:flex")}>
          <div className={cn("m-3 shrink-0 rounded-xl border p-2", !selected ? "border-primary" : "border-border")}>
            <p className="flex items-center gap-1.5 px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-primary"><Bot className="h-3.5 w-3.5" />Agente</p>
            <Button className="w-full" onClick={createThread}><MessageSquarePlus className="mr-2 h-4 w-4" />Nuova chat</Button>
            <div className="mt-1.5 max-h-40 space-y-1 overflow-y-auto">
              {threads.map((t) => (
                <div key={t.id} className={cn("group flex items-center rounded-lg", !selected && activeThread?.id === t.id ? "bg-muted" : "hover:bg-muted/60")}>
                  <button type="button" onClick={() => openThread(t.id)} className="min-w-0 flex-1 px-3 py-2 text-left">
                    <span className="block truncate text-sm">{t.title}</span>
                    <span className="block text-[11px] text-muted-foreground">{new Date(t.updatedAt).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </button>
                  <button type="button" aria-label="Elimina conversazione" onClick={() => deleteThread(t.id)} className="mr-1 rounded p-1.5 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
          <p className="flex items-center gap-1.5 px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><MessageSquare className="h-3.5 w-3.5" />Chat clienti</p>
          <div className="shrink-0 space-y-2 border-b p-3 pt-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input aria-label="Cerca cliente" placeholder="Nome, email o telefono…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="grid grid-cols-1 gap-2">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger aria-label="Fase" className="h-9 min-w-0 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le fasi</SelectItem>
              {CRM_STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
            </SelectContent>
          </Select>
            </div>
            <p className="text-xs text-muted-foreground">{rows.length} clienti{onlyQueue ? " in coda" : ""}</p>
          </div>
          <div aria-label="Elenco clienti" className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          {rows.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Nessun cliente in questa vista.</p>}
          {rows.map((row) => (
            <Button key={row.lead.id} type="button" variant="ghost" aria-pressed={selectedId === row.lead.id} onClick={() => setSelectedId(row.lead.id)}
              className={cn("block h-auto w-full rounded-none border-b border-l-[3px] border-l-transparent px-3 py-3.5 text-left font-normal whitespace-normal transition-colors hover:bg-muted hover:text-foreground", selectedId === row.lead.id && "border-l-primary bg-accent/60")}>
              <span className="flex items-start justify-between gap-2">
                <span className="min-w-0 flex-1 break-words text-sm font-semibold leading-snug">{row.lead.company_name || row.lead.contact_name || "Senza nome"}</span>
                {row.summary && <span className="shrink-0 text-[10px] text-muted-foreground" title={new Date(row.summary.lastAt).toLocaleString("it-IT")}>{interactionRelativeTime(row.summary.lastAt)}</span>}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                {CRM_STAGES.find((s) => s.id === row.lead.status)?.title}
                {row.summary && <span>· {row.summary.count} messaggi</span>}
              </span>
              {row.summary && <span className="mt-1.5 line-clamp-2 block break-words text-xs leading-relaxed text-muted-foreground">{row.summary?.channel && <span className="font-medium">{CHANNELS[row.summary.channel as keyof typeof CHANNELS]?.short}: </span>}{row.summary.preview}</span>}
              {(row.reason || row.paused) && <span className="mt-2 flex flex-wrap gap-1.5">
                {row.reason && <Badge variant="outline" className={cn("h-auto min-h-5 text-[10px] font-normal", row.reason.severity === "overdue" ? "border-destructive/25 bg-destructive/5 text-destructive" : "border-border bg-muted text-muted-foreground")}>{row.reason.label}</Badge>}
                {row.paused && <Badge variant="outline" className="h-5 text-[10px]"><PauseCircle className="h-3 w-3" />Pausa</Badge>}
              </span>}
            </Button>
          ))}
          </div>
        </div>

        <div className={cn("flex min-h-0 min-w-0 overflow-hidden flex-col", !selected && "hidden md:flex")}>
          {selected ? (
            <>
              <Button variant="ghost" size="sm" className="w-fit md:hidden" onClick={() => setSelectedId(null)}>
                <ChevronLeft className="mr-1 h-4 w-4" />Elenco
              </Button>
              <BrunoPanel key={selected.id} lead={selected} onUpdated={load} />
            </>
          ) : activeThread ? (
            <BrunoAgentChat key={activeThread.id} thread={activeThread} onChange={updateThread} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
