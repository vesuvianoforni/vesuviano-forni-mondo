import { forwardRef, useState } from "react";
import type { DraggableProvided } from "@hello-pangea/dnd";
import { MessageSquare, Building2, Calendar, CalendarPlus, Clock, Edit, GripVertical, Mail, MoreHorizontal, Phone, Trash2, Trophy, User, XCircle, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CRM_STAGES } from "@/lib/crmPipeline";
import { activityLabels, activityTiming, exactActivityDate, interactionLabels, interactionRelativeTime, type LeadInteraction } from "@/lib/crmActivity";
import { cn } from "@/lib/utils";

export interface CRMLead {
  id: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  value?: number;
  source?: string;
  status: string;
  pipeline?: string;
  notes?: string;
  assigned_to?: string;
  next_activity_type?: string;
  next_activity_date?: string;
  next_activity_notes?: string;
  next_activity_assigned_to?: string;
  created_at: string;
  updated_at: string;
  website_lead_id?: string | null;
}

const sourceLabels: Record<string, string> = {
  website: "Web", configuratore: "Configuratore", chat: "Chat", referral: "Referral",
  social_media: "Social", cold_call: "Cold Call", trade_show: "Fiera", zapier: "Zapier", other: "Altro",
};

interface CRMLeadCardProps {
  lead: CRMLead;
  activityAssignee?: string;
  draggableProps?: DraggableProvided["draggableProps"];
  dragHandleProps?: DraggableProvided["dragHandleProps"];
  isDragging?: boolean;
  lastInteraction?: LeadInteraction | null;
  interactionState?: "loading" | "ready" | "partial";
  now?: Date;
  onSchedule: (lead: CRMLead) => void;
  onConverse?: (lead: CRMLead) => void;
  onEdit: (lead: CRMLead) => void;
  onDelete: (id: string) => void;
  onSetStatus: (lead: CRMLead, status: "vinto" | "perso") => void;
}

export const CRMLeadCard = forwardRef<HTMLDivElement, CRMLeadCardProps>(function CRMLeadCard(
  { lead, activityAssignee, draggableProps, dragHandleProps, isDragging, lastInteraction, interactionState = "ready", now = new Date(), onSchedule, onConverse, onEdit, onDelete, onSetStatus }, ref,
) {
  const [confirmation, setConfirmation] = useState<"delete" | "vinto" | "perso" | null>(null);
  const name = lead.company_name || lead.contact_name || "Senza nome";
  const closed = lead.status === "vinto" || lead.status === "perso";
  const stage = CRM_STAGES.find(item => item.id === lead.status);
  const timing = activityTiming(lead.next_activity_date, now);
  const timingColor = timing.state === "overdue" ? "text-destructive" : timing.state === "today" ? "text-primary" : "text-muted-foreground";

  return (
    <TooltipProvider delayDuration={200}>
      <Card ref={ref} {...draggableProps} aria-label={`Lead ${name}`}
        className={cn("min-w-0 transition-shadow hover:shadow-md motion-reduce:transition-none", isDragging && "shadow-lg")}>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <Building2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <Button variant="link" className="h-auto min-w-0 justify-start whitespace-normal p-0 text-left text-sm font-semibold leading-5 text-card-foreground"
                  aria-label={`Apri lead ${name}`} onClick={() => (onConverse ?? onEdit)(lead)}>
                  <span className="min-w-0 break-words">{name}</span>
                </Button>
              </div>
              {lead.company_name && lead.contact_name && <p className="ml-6 mt-1 break-words text-xs text-muted-foreground">{lead.contact_name}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              {onConverse && <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted hover:text-foreground"
                    aria-label={`Comunicazioni con ${name}`} onClick={() => onConverse(lead)}><MessageSquare className="h-3.5 w-3.5" /></Button>
                </TooltipTrigger>
                <TooltipContent>Comunicazioni e Bruno</TooltipContent>
              </Tooltip>}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted hover:text-foreground"
                    aria-label={`Modifica lead ${name}`} onClick={() => onEdit(lead)}><Edit className="h-3.5 w-3.5" /></Button>
                </TooltipTrigger>
                <TooltipContent>Modifica lead</TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild><DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted hover:text-foreground" aria-label={`Altre azioni ${name}`}><MoreHorizontal /></Button>
                  </DropdownMenuTrigger></TooltipTrigger>
                  <TooltipContent>Altre azioni</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onSchedule(lead)}><CalendarPlus className="mr-2 h-4 w-4" />Pianifica attività</DropdownMenuItem>
                  {!closed && <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setConfirmation("vinto")}><Trophy className="mr-2 h-4 w-4" />Segna come vinto</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setConfirmation("perso")}><XCircle className="mr-2 h-4 w-4" />Segna come perso</DropdownMenuItem>
                  </>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={() => setConfirmation("delete")}><Trash2 className="mr-2 h-4 w-4" />Elimina lead</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialog open={confirmation !== null} onOpenChange={open => { if (!open) setConfirmation(null); }}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{confirmation === "delete" ? "Eliminare il lead?" : `Segnare il lead come ${confirmation}?`}</AlertDialogTitle>
                    <AlertDialogDescription>{confirmation === "delete" ? `${name} verrà eliminato definitivamente. Questa azione non può essere annullata.` : `${name} verrà spostato tra i lead chiusi con esito ${confirmation}.`}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction className={confirmation === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                      onClick={() => {
                        if (confirmation === "delete") onDelete(lead.id);
                        else if (confirmation === "vinto" || confirmation === "perso") onSetStatus(lead, confirmation);
                      }}>{confirmation === "delete" ? "Elimina" : "Conferma"}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {(lead.email || lead.phone) && (
            <div className="space-y-2 border-t pt-3">
              {lead.email && <div className="flex min-w-0 items-start gap-2 text-xs text-muted-foreground">
                <Mail aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" /><span className="min-w-0 break-all">{lead.email}</span>
              </div>}
              {lead.phone && <div className="flex min-w-0 items-start gap-2 text-xs text-muted-foreground">
                <Phone aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" /><span className="min-w-0 break-words">{lead.phone}</span>
              </div>}
            </div>
          )}

          <div className="space-y-3 border-t pt-3">
            <div>
              <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground"><Clock aria-hidden="true" className="h-3 w-3 shrink-0" /><span>Ultima interazione</span></div>
              {lastInteraction ? <div className="ml-5 space-y-1 text-xs">
                <time dateTime={lastInteraction.at} title={exactActivityDate(lastInteraction.at)} className="font-medium">{interactionRelativeTime(lastInteraction.at, now)}</time>
                <p className="text-muted-foreground">{interactionLabels[lastInteraction.kind]}</p>
                {interactionState === "partial" && <p className="text-muted-foreground">Storico parziale</p>}
              </div> : <p className="ml-5 text-xs text-muted-foreground">{interactionState === "loading" ? "Caricamento…" : interactionState === "partial" ? "Storico non disponibile" : "Nessuna registrata"}</p>}
            </div>
            <div className="border-t pt-3">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium"><Calendar aria-hidden="true" className="h-3 w-3 shrink-0" /><span>Prossima attività</span></div>
                <Tooltip>
                  <TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 hover:bg-muted hover:text-foreground" aria-label={`Pianifica attività ${name}`} onClick={() => onSchedule(lead)}><CalendarPlus /></Button></TooltipTrigger>
                  <TooltipContent>{timing.date ? "Modifica attività" : "Pianifica attività"}</TooltipContent>
                </Tooltip>
              </div>
              <div className="ml-5 space-y-1.5 text-xs">
                {lead.next_activity_type && <p className="break-words font-medium">{activityLabels[lead.next_activity_type] || lead.next_activity_type}</p>}
                {timing.date ? <time dateTime={timing.date.toISOString()} title={exactActivityDate(timing.date.toISOString())} className={cn("block font-medium", timingColor)}>{timing.label}</time> :
                  <Button variant="link" className="h-auto whitespace-normal p-0 text-xs text-primary" onClick={() => onSchedule(lead)}>Da pianificare</Button>}
                {lead.next_activity_notes && <p className="line-clamp-2 break-words italic text-muted-foreground" title={lead.next_activity_notes}>{lead.next_activity_notes}</p>}
                {activityAssignee && <div className="flex min-w-0 items-start gap-1.5 text-muted-foreground"><User aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" /><span className="min-w-0 break-all">{activityAssignee}</span></div>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {lead.value != null && <span className="max-w-full break-all rounded bg-secondary/10 px-2 py-1 text-sm font-semibold text-secondary">€{lead.value.toLocaleString("it-IT")}</span>}
              {closed && stage && <Badge className={stage.color}>{stage.title}</Badge>}
            </div>
            <div className="ml-auto flex min-w-0 items-center gap-2">
              {lead.source && <Badge variant="outline" className="min-w-0 gap-1 whitespace-normal break-words text-xs">
                {lead.source === "zapier" && <Zap aria-hidden="true" className="h-3 w-3 shrink-0" />}{sourceLabels[lead.source] || lead.source}
              </Badge>}
              {dragHandleProps && <Tooltip>
                <TooltipTrigger asChild>
                  <Button {...dragHandleProps} variant="ghost" size="icon" className="h-8 w-8 shrink-0 cursor-grab hover:bg-muted hover:text-foreground active:cursor-grabbing"
                    aria-label={`Sposta lead ${name}`}><GripVertical className="h-4 w-4" /></Button>
                </TooltipTrigger>
                <TooltipContent>Sposta lead</TooltipContent>
              </Tooltip>}
            </div>
          </div>

        </CardContent>
      </Card>
    </TooltipProvider>
  );
});