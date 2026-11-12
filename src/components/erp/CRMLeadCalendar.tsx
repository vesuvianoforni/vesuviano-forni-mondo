import { useMemo, useState } from "react";
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { it } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { activityLabels } from "@/lib/crmActivity";
import type { CRMLead } from "@/components/erp/CRMLeadCard";

interface Props { leads: CRMLead[]; now: Date; onOpen: (lead: CRMLead) => void }

/** Vista mensile in sola lettura delle prossime attività pianificate sui lead. */
export function CRMLeadCalendar({ leads, now, onOpen }: Props) {
  const [month, setMonth] = useState(() => startOfMonth(now));
  const scheduled = useMemo(() => leads
    .filter(l => l.next_activity_date)
    .map(l => ({ lead: l, at: new Date(l.next_activity_date as string) }))
    .sort((a, b) => a.at.getTime() - b.at.getTime()), [leads]);
  const days = useMemo(() => {
    const out: Date[] = [];
    for (let d = startOfWeek(startOfMonth(month), { weekStartsOn: 1 }); d <= endOfWeek(endOfMonth(month), { weekStartsOn: 1 }); d = addDays(d, 1)) out.push(d);
    return out;
  }, [month]);
  const overdue = scheduled.filter(s => s.at < now).length;

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="icon" variant="outline" className="h-8 w-8" aria-label="Mese precedente" onClick={() => setMonth(m => addMonths(m, -1))}><ChevronLeft className="h-4 w-4" /></Button>
        <h3 className="min-w-[150px] text-center font-semibold capitalize">{format(month, "LLLL yyyy", { locale: it })}</h3>
        <Button size="icon" variant="outline" className="h-8 w-8" aria-label="Mese successivo" onClick={() => setMonth(m => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></Button>
        <Button size="sm" variant="ghost" onClick={() => setMonth(startOfMonth(now))}>Oggi</Button>
        <span className="text-sm text-muted-foreground">{scheduled.length} attività pianificate{overdue ? ` · ${overdue} scadute` : ""}</span>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[760px] grid-cols-7 overflow-hidden rounded-lg border bg-border gap-px">
          {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map(d => <div key={d} className="bg-muted px-2 py-1.5 text-xs font-medium text-muted-foreground">{d}</div>)}
          {days.map(day => {
            const items = scheduled.filter(s => isSameDay(s.at, day));
            const today = isSameDay(day, now);
            return (
              <div key={day.toISOString()} className={`min-h-[110px] bg-card p-1.5 ${isSameMonth(day, month) ? "" : "opacity-50"}`}>
                <div className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${today ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"}`}>{format(day, "d")}</div>
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {items.map(({ lead, at }) => (
                    <button key={lead.id} type="button" onClick={() => onOpen(lead)}
                      title={lead.next_activity_notes || undefined}
                      className={`block w-full truncate rounded px-1.5 py-1 text-left text-xs hover:opacity-80 ${at < now ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-foreground"}`}>
                      <span className="font-medium">{format(at, "HH:mm")}</span>{" "}
                      {activityLabels[lead.next_activity_type as keyof typeof activityLabels] ?? lead.next_activity_type ?? "Attività"} · {lead.company_name || lead.contact_name || "Senza nome"}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
