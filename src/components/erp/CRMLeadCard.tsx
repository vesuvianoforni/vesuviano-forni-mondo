import { forwardRef } from "react";
import type { DraggableProvided } from "@hello-pangea/dnd";
import { Building2, Calendar, Clock, Edit, GripVertical, Mail, Phone, Trash2, Trophy, User, XCircle, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CRM_STAGES } from "@/lib/crmPipeline";
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
}

const sourceLabels: Record<string, string> = {
  website: "Web", configuratore: "Configuratore", chat: "Chat", referral: "Referral",
  social_media: "Social", cold_call: "Cold Call", trade_show: "Fiera", zapier: "Zapier", other: "Altro",
};

const activityLabels: Record<string, string> = {
  call: "Chiamata", email: "Email", meeting: "Incontro", whatsapp: "WhatsApp",
  demo: "Demo", follow_up: "Follow-up", quote: "Preventivo",
};

interface CRMLeadCardProps {
  lead: CRMLead;
  activityAssignee?: string;
  draggableProps?: DraggableProvided["draggableProps"];
  dragHandleProps?: DraggableProvided["dragHandleProps"];
  isDragging?: boolean;
  onEdit: (lead: CRMLead) => void;
  onDelete: (id: string) => void;
  onSetStatus: (lead: CRMLead, status: "vinto" | "perso") => void;
}

export const CRMLeadCard = forwardRef<HTMLDivElement, CRMLeadCardProps>(function CRMLeadCard(
  { lead, activityAssignee, draggableProps, dragHandleProps, isDragging, onEdit, onDelete, onSetStatus }, ref,
) {
  const name = lead.company_name || lead.contact_name || "Senza nome";
  const closed = lead.status === "vinto" || lead.status === "perso";
  const stage = CRM_STAGES.find(item => item.id === lead.status);
  const activityDate = lead.next_activity_date ? new Date(lead.next_activity_date) : null;
  const validActivityDate = activityDate && !Number.isNaN(activityDate.getTime()) ? activityDate : null;
  const hasActivity = Boolean(lead.next_activity_type || validActivityDate || lead.next_activity_notes || activityAssignee);

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
                  aria-label={`Apri lead ${name}`} onClick={() => onEdit(lead)}>
                  <span className="min-w-0 break-words">{name}</span>
                </Button>
              </div>
              {lead.company_name && lead.contact_name && <p className="ml-6 mt-1 break-words text-xs text-muted-foreground">{lead.contact_name}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted hover:text-foreground"
                    aria-label={`Modifica lead ${name}`} onClick={() => onEdit(lead)}><Edit className="h-3.5 w-3.5" /></Button>
                </TooltipTrigger>
                <TooltipContent>Modifica lead</TooltipContent>
              </Tooltip>
              <AlertDialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Elimina lead ${name}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Elimina lead</TooltipContent>
                </Tooltip>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminare il lead?</AlertDialogTitle>
                    <AlertDialogDescription>Questa azione non può essere annullata. Il lead verrà eliminato definitivamente.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => onDelete(lead.id)}>Elimina</AlertDialogAction>
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

          {hasActivity && <div className="border-t pt-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
              <Calendar aria-hidden="true" className="h-3 w-3 shrink-0" /><span>Prossima attività</span>
            </div>
            <div className="ml-5 space-y-1.5 text-xs text-muted-foreground">
              {lead.next_activity_type && <p className="break-words font-medium text-card-foreground">{activityLabels[lead.next_activity_type] || lead.next_activity_type}</p>}
              {validActivityDate && <div className="flex items-start gap-1.5">
                <Clock aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />
                <time dateTime={validActivityDate.toISOString()}>{validActivityDate.toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
              </div>}
              {lead.next_activity_notes && <p className="line-clamp-2 break-words italic" title={lead.next_activity_notes}>{lead.next_activity_notes}</p>}
              {activityAssignee && <div className="flex min-w-0 items-start gap-1.5">
                <User aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" /><span className="min-w-0 break-all">{activityAssignee}</span>
              </div>}
            </div>
          </div>}

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

          {!closed && <div className="flex gap-2 border-t pt-3">
            <Button size="sm" variant="outline" className="min-w-0 flex-1 gap-1.5 border-secondary/30 text-secondary hover:bg-secondary/10 hover:text-secondary"
              aria-label={`Segna vinto ${name}`} onClick={() => onSetStatus(lead, "vinto")}><Trophy className="h-3.5 w-3.5" />Vinto</Button>
            <Button size="sm" variant="outline" className="min-w-0 flex-1 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Segna perso ${name}`} onClick={() => onSetStatus(lead, "perso")}><XCircle className="h-3.5 w-3.5" />Perso</Button>
          </div>}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
});