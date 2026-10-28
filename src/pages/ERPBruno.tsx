import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot, PauseCircle, Search, AlertTriangle, Loader2, ChevronLeft, MessageSquare } from "lucide-react";
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

const pipelines = ["Vesuviano", "ZAPPER", "ZAPPER Pro"];
const PAGE = 1000;

interface Summary { count: number; lastAt: string; preview: string; channel: string; }

async function readAllMessages() {
  const rows: Array<{ lead_id: string; created_at: string; body: string; channel: string; direction: string }> = [];
  for (let from = 0; from < 10_000; from += PAGE) {
    const { data, error } = await supabase.from("crm_messages").select("lead_id,created_at,body,channel,direction")
      .order("created_at", { ascending: false }).order("id").range(from, from + PAGE - 1);
    if (error) throw error;
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE) break;
  }
  return rows;
}

export default function ERPBruno() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<BrunoLead[]>([]);
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pipeline, setPipeline] = useState("Vesuviano");
  const [stageFilter, setStageFilter] = useState("all");
  const [onlyQueue, setOnlyQueue] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
      setLeads(all);
      const map: Record<string, Summary> = {};
      for (const m of await readAllMessages()) {
        const current = map[m.lead_id];
        if (!current) map[m.lead_id] = { count: 1, lastAt: m.created_at, preview: m.body.slice(0, 90), channel: m.channel };
        else current.count += 1;
      }
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

  const { interactions } = useCRMInteractions(leads);

  const rows = useMemo(() => leads
    .filter((lead) => !pipeline || lead.pipeline === pipeline)
    .map((lead) => {
      const summary = summaries[lead.id];
      const siteAt = interactions[lead.id]?.at ?? null;
      const lastContactAt = [siteAt, summary?.lastAt].filter(Boolean)
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
      const delta = rank(a.reason) - rank(b.reason);
      if (delta !== 0) return delta;
      const left = a.summary?.lastAt || a.lastContactAt || a.lead.created_at;
      const right = b.summary?.lastAt || b.lastContactAt || b.lead.created_at;
      return new Date(right).getTime() - new Date(left).getTime();
    }), [leads, summaries, interactions, pipeline, stageFilter, onlyQueue, search, now]);

  const selected = rows.find((row) => row.lead.id === selectedId)?.lead ?? leads.find((lead) => lead.id === selectedId) ?? null;
  const queued = rows.filter((row) => row.reason).length;
  const pausedCount = rows.filter((row) => row.paused).length;

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 w-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b p-4">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold"><Bot className="h-5 w-5 text-primary" />Bruno</h1>
          <p className="text-xs text-muted-foreground">{queued} clienti da contattare · {pausedCount} in pausa</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 basis-full sm:basis-56">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cerca cliente…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={pipeline} onValueChange={setPipeline}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>{pipelines.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le fasi</SelectItem>
              {CRM_STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant={onlyQueue ? "default" : "outline"} onClick={() => setOnlyQueue(!onlyQueue)}>
            <AlertTriangle className="mr-1 h-3.5 w-3.5" />Solo in coda
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-[340px_1fr]">
        <div className={cn("min-h-0 overflow-y-auto border-r", selected && "hidden md:block")}>
          {rows.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Nessun cliente in questa vista.</p>}
          {rows.map((row) => (
            <button key={row.lead.id} type="button" onClick={() => setSelectedId(row.lead.id)}
              className={cn("w-full border-b p-3 text-left transition-colors hover:bg-muted/50", selectedId === row.lead.id && "bg-muted")}>
              <span className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1 break-words text-sm font-medium">{row.lead.company_name || row.lead.contact_name || "Senza nome"}</span>
                {row.reason && <Badge variant={row.reason.severity === "overdue" ? "destructive" : "secondary"} className="h-5 text-[10px]">{row.reason.label}</Badge>}
                {row.paused && <Badge variant="outline" className="h-5 text-[10px]"><PauseCircle className="mr-1 h-3 w-3" />Pausa</Badge>}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                {CRM_STAGES.find((s) => s.id === row.lead.status)?.title}
                {row.summary && <span>· {row.summary.count} messaggi</span>}
                {row.summary?.channel && <span>· {CHANNELS[row.summary.channel as keyof typeof CHANNELS]?.short}</span>}
              </span>
              {row.summary && <span className="mt-1 line-clamp-2 block break-words text-xs text-muted-foreground">{row.summary.preview}</span>}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-col">
          {selected ? (
            <>
              <Button variant="ghost" size="sm" className="w-fit md:hidden" onClick={() => setSelectedId(null)}>
                <ChevronLeft className="mr-1 h-4 w-4" />Elenco
              </Button>
              <BrunoPanel key={selected.id} lead={selected} onUpdated={load} />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <MessageSquare className="h-6 w-6" />
              <p>Seleziona un cliente per vedere le comunicazioni e scrivere con Bruno.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
