import { useEffect, useState } from "react";
import { Bot, CalendarPlus, Copy, ExternalLink, MessageSquare, MoreHorizontal, Pencil, Phone, Mail, Building2, Trash2, Trophy, XCircle, Zap } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "radix-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CRM_STAGES } from "@/lib/crmPipeline";
import { activityLabels, activityTiming, exactActivityDate, interactionLabels, interactionRelativeTime, type LeadInteraction } from "@/lib/crmActivity";
import { BrunoPanel, type BrunoLead } from "./BrunoPanel";
import type { CRMLead } from "./CRMLeadCard";

const SITE = "https://vesuvianoforni.com";

const sourceLabels: Record<string, string> = {
  website: "Web", configuratore: "Configuratore", chat: "Chat", referral: "Referral",
  social_media: "Social", cold_call: "Cold Call", trade_show: "Fiera", zapier: "Zapier", other: "Altro",
};

interface Session {
  id: string; token: string; created_at: string; last_opened_at: string | null;
  status: string; pipeline_stage: string; price_list: string; expires_at: string | null;
}

interface Props {
  lead: BrunoLead | null;
  open: boolean;
  defaultTab?: "riepilogo" | "comunicazioni" | "configuratore";
  onOpenChange: (open: boolean) => void;
  onEdit: (lead: CRMLead) => void;
  onSchedule: (lead: CRMLead) => void;
  onDelete: (id: string) => void;
  onSetStatus: (lead: CRMLead, status: "vinto" | "perso") => void;
  onUpdated?: () => void;
  lastInteraction?: LeadInteraction | null;
  activityAssignee?: string;
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="break-words text-sm">{value || "—"}</p>
    </div>
  );
}

export function CRMLeadDetail({ lead, open, defaultTab = "riepilogo", onOpenChange, onEdit, onSchedule, onDelete, onSetStatus, onUpdated, lastInteraction, activityAssignee }: Props) {
  const { toast } = useToast();
  const [tab, setTab] = useState(defaultTab);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => { if (open) setTab(defaultTab); }, [open, defaultTab]);

  useEffect(() => {
    if (!open || !lead) { setSessions([]); return; }
    let active = true;
    const columns = "id,token,created_at,last_opened_at,status,pipeline_stage,price_list,expires_at";
    const terms = [lead.email ? supabase.from("configurator_sessions").select(columns).eq("customer_email", lead.email) : null,
      lead.phone ? supabase.from("configurator_sessions").select(columns).eq("customer_phone", lead.phone) : null].filter(Boolean);
    Promise.all(terms.map((q) => (q as PromiseLike<{ data: Session[] | null }>).then((r) => r.data ?? [])))
      .then((batches) => {
        if (!active) return;
        const seen = new Set<string>();
        setSessions(batches.flat().filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      })
      .catch(() => { if (active) setSessions([]); });
    return () => { active = false; };
  }, [open, lead?.id]);

  if (!lead) return null;
  const name = lead.company_name || lead.contact_name || "Senza nome";
  const stage = CRM_STAGES.find((s) => s.id === lead.status);
  const timing = activityTiming(lead.next_activity_date);

  const copyLink = async (token: string) => {
    const link = `${SITE}/configuratore/${token}`;
    try { await navigator.clipboard.writeText(link); toast({ title: "Link copiato", description: link }); }
    catch { toast({ title: "Link", description: link }); }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 data-[side=right]:sm:max-w-3xl">
        <VisuallyHidden.Root asChild><SheetTitle>Scheda cliente</SheetTitle></VisuallyHidden.Root>
        <VisuallyHidden.Root asChild><SheetDescription>Dettaglio del cliente con comunicazioni e configuratore.</SheetDescription></VisuallyHidden.Root>

        <div className="flex items-start justify-between gap-3 border-b p-4">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 break-words text-lg font-semibold">
              <Building2 aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />{name}
              {stage && <Badge variant="secondary" className={stage.color}>{stage.title}</Badge>}
            </p>
            <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
              {lead.contact_name && <span>{lead.contact_name}</span>}
              {lead.city && <span>{lead.city}</span>}
              {lead.pipeline && <span>{lead.pipeline}</span>}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button size="sm" variant="outline" onClick={() => onEdit(lead)}><Pencil className="mr-1 h-3.5 w-3.5" />Modifica</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" aria-label="Altre azioni"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onSchedule(lead)}><CalendarPlus className="mr-2 h-4 w-4" />Pianifica attività</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onSetStatus(lead, "vinto")}><Trophy className="mr-2 h-4 w-4" />Segna come vinto</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onSetStatus(lead, "perso")}><XCircle className="mr-2 h-4 w-4" />Segna come perso</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onSelect={() => onDelete(lead.id)}><Trash2 className="mr-2 h-4 w-4" />Elimina</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-4 mt-3 w-fit">
            <TabsTrigger value="riepilogo">Riepilogo</TabsTrigger>
            <TabsTrigger value="comunicazioni" className="gap-1"><MessageSquare className="h-3.5 w-3.5" />Comunicazioni</TabsTrigger>
            <TabsTrigger value="configuratore" className="gap-1"><Zap className="h-3.5 w-3.5" />Configuratore</TabsTrigger>
          </TabsList>

          <TabsContent value="riepilogo" className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
              <Card>
                <CardContent className="space-y-3 p-4">
                  <h3 className="text-sm font-semibold">Contatti</h3>
                  <Field label="Email" value={lead.email && <a className="inline-flex items-center gap-1 underline" href={`mailto:${lead.email}`}><Mail className="h-3 w-3" />{lead.email}</a>} />
                  <Field label="Telefono" value={lead.phone && <a className="inline-flex items-center gap-1 underline" href={`tel:${lead.phone}`}><Phone className="h-3 w-3" />{lead.phone}</a>} />
                  <Field label="Ultima interazione" value={lastInteraction ? `${interactionLabels[lastInteraction.kind]} · ${interactionRelativeTime(lastInteraction.at)}` : "Non registrata"} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-3 p-4">
                  <h3 className="text-sm font-semibold">Affare</h3>
                  <Field label="Valore" value={lead.value ? `€${lead.value.toLocaleString("it-IT")}` : "Non stimato"} />
                  <Field label="Fonte" value={lead.source ? sourceLabels[lead.source] || lead.source : undefined} />
                  <Field label="Assegnato a" value={activityAssignee} />
                </CardContent>
              </Card>
              <Card className="sm:col-span-2">
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">Prossima attività</h3>
                    <Button size="sm" variant="outline" onClick={() => onSchedule(lead)}><CalendarPlus className="mr-1 h-3.5 w-3.5" />Pianifica</Button>
                  </div>
                  {lead.next_activity_date ? (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant={timing.state === "overdue" ? "destructive" : "secondary"}>{timing.label}</Badge>
                      <span>{lead.next_activity_type ? activityLabels[lead.next_activity_type] || lead.next_activity_type : "Attività"}</span>
                      <span className="text-xs text-muted-foreground">{exactActivityDate(lead.next_activity_date)}</span>
                    </div>
                  ) : <p className="text-sm text-muted-foreground">Da pianificare</p>}
                  {lead.next_activity_notes && <p className="whitespace-pre-wrap break-words text-sm">{lead.next_activity_notes}</p>}
                </CardContent>
              </Card>
              {lead.notes && (
                <Card className="sm:col-span-2">
                  <CardContent className="p-4">
                    <h3 className="mb-2 text-sm font-semibold">Note</h3>
                    <p className="whitespace-pre-wrap break-words text-sm">{lead.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comunicazioni" className="flex min-h-0 flex-1 flex-col">
            <BrunoPanel lead={lead} onUpdated={onUpdated} />
          </TabsContent>

          <TabsContent value="configuratore" className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-3 p-4">
              {sessions.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nessun configuratore aperto per questo cliente.</p>}
              {sessions.map((s) => (
                <Card key={s.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Bot className="h-4 w-4 text-primary" />Listino {s.price_list}
                        <Badge variant="outline">{CRM_STAGES.find((x) => x.id === s.pipeline_stage)?.title ?? s.pipeline_stage}</Badge>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Aperto {s.last_opened_at ? new Date(s.last_opened_at).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "mai"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyLink(s.token)}><Copy className="mr-1 h-3.5 w-3.5" />Copia link</Button>
                      <Button size="sm" variant="ghost" asChild><a href={`${SITE}/configuratore/${s.token}`} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-3.5 w-3.5" />Apri</a></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
