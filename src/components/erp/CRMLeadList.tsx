import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CRM_STAGES } from "@/lib/crmPipeline";
import { activityLabels, activityTiming, exactActivityDate, interactionLabels, interactionRelativeTime, type LeadInteraction } from "@/lib/crmActivity";
import type { CRMLeadSort } from "@/lib/crmLeadSort";
import type { CRMLead } from "@/components/erp/CRMLeadCard";
import { cn } from "@/lib/utils";
import { CRMCallButton } from './CRMCallProvider';

const PAGE = 100;

interface Props {
  leads: CRMLead[];
  interactions: Record<string, LeadInteraction | null | undefined>;
  interactionState: "loading" | "ready" | "partial";
  now: Date;
  sort: CRMLeadSort;
  onSort: (sort: CRMLeadSort) => void;
  onOpen: (lead: CRMLead) => void;
  onConverse: (lead: CRMLead) => void;
  onSchedule: (lead: CRMLead) => void;
}

export function CRMLeadList({ leads, interactions, interactionState, now, sort, onSort, onOpen, onConverse, onSchedule }: Props) {
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [sort, leads.length]);
  const visible = leads.slice(0, limit);

  const SortHead = ({ id, children, className }: { id: CRMLeadSort; children: React.ReactNode; className?: string }) => {
    const active = sort === id;
    const Icon = id === "next_activity" || id === "name" ? ArrowUp : ArrowDown;
    return (
      <TableHead className={className} aria-sort={active ? (id === "next_activity" || id === "name" ? "ascending" : "descending") : "none"}>
        <button type="button" onClick={() => onSort(id)} className={cn("inline-flex items-center gap-1 hover:text-foreground", active && "font-semibold text-foreground")}>
          {children}{active && <Icon aria-hidden="true" className="h-3 w-3" />}
        </button>
      </TableHead>
    );
  };

  if (!leads.length) return <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">Nessun lead trovato.</p>;

  return (
    <div className="min-w-0 space-y-3">
      <div className="w-full min-w-0 overflow-x-auto rounded-lg border">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <SortHead id="name" className="min-w-[180px]">Cliente</SortHead>
              <TableHead>Fase</TableHead>
              <TableHead className="min-w-[160px]">Contatti</TableHead>
              <SortHead id="last_contact" className="min-w-[130px]">Ultimo contatto</SortHead>
              <SortHead id="next_activity" className="min-w-[140px]">Prossima attività</SortHead>
              <SortHead id="newest">Ingresso</SortHead>
              <TableHead>Fonte</TableHead>
              <SortHead id="value">Valore</SortHead>
              <TableHead className="w-10"><span className="sr-only">Azioni</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map(lead => {
              const name = lead.company_name || lead.contact_name || "Senza nome";
              const stage = CRM_STAGES.find(s => s.id === lead.status);
              const last = interactions[lead.id];
              const timing = activityTiming(lead.next_activity_date, now);
              return (
                <TableRow key={lead.id} className="cursor-pointer" onClick={() => onOpen(lead)}>
                  <TableCell className="max-w-[240px] py-2">
                    <button type="button" className="block max-w-full truncate text-left font-semibold hover:underline" title={name} onClick={e => { e.stopPropagation(); onOpen(lead); }}>{name}</button>
                    {lead.company_name && lead.contact_name && lead.contact_name !== lead.company_name && <span className="block truncate text-muted-foreground">{lead.contact_name}</span>}
                  </TableCell>
                  <TableCell className="py-2">{stage && <Badge variant="secondary" className={cn("whitespace-nowrap", stage.color)}>{stage.title}</Badge>}</TableCell>
                  <TableCell className="max-w-[220px] py-2 text-muted-foreground">
                    {lead.phone && <CRMCallButton lead={lead} showNumber />}
                    {lead.email && <span className="block truncate" title={lead.email}>{lead.email}</span>}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2">
                    {last ? <><time dateTime={last.at} title={exactActivityDate(last.at)} className="font-medium">{interactionRelativeTime(last.at, now)}</time>
                      <span className="block text-muted-foreground">{interactionLabels[last.kind]}</span></>
                      : <span className="text-muted-foreground">{interactionState === "loading" ? "…" : "—"}</span>}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2" onClick={e => { e.stopPropagation(); onSchedule(lead); }}>
                    {timing.date ? <button type="button" className="text-left hover:underline">
                      <span className={cn("font-medium", timing.state === "overdue" ? "text-destructive" : timing.state === "today" ? "text-primary" : "")}>{timing.label}</span>
                      {lead.next_activity_type && <span className="block text-muted-foreground">{activityLabels[lead.next_activity_type] || lead.next_activity_type}</span>}
                    </button> : <button type="button" className="text-primary hover:underline">Pianifica</button>}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 text-muted-foreground">
                    <time dateTime={lead.created_at} title={exactActivityDate(lead.created_at)}>{new Date(lead.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "2-digit" })}</time>
                  </TableCell>
                  <TableCell className="py-2">{lead.source && <Badge variant="outline" className="whitespace-nowrap font-normal">{lead.source}</Badge>}</TableCell>
                  <TableCell className="whitespace-nowrap py-2 font-medium">{lead.value != null ? `€${lead.value.toLocaleString("it-IT")}` : "—"}</TableCell>
                  <TableCell className="py-2">
                    <Button size="icon" variant="ghost" className="h-7 w-7" aria-label={`Comunicazioni con ${name}`} onClick={e => { e.stopPropagation(); onConverse(lead); }}><MessageSquare className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{visible.length} di {leads.length} lead</span>
        {limit < leads.length && <Button variant="outline" size="sm" onClick={() => setLimit(l => l + PAGE)}>Mostra altri {Math.min(PAGE, leads.length - limit)}</Button>}
      </div>
    </div>
  );
}
