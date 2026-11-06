import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { leadCountries, leadCountryFromPhone } from "@/lib/leadCountry";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, TrendingUp, Building2, Calendar, Trophy, ArrowUpDown, LayoutGrid, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CRMLeadList } from "@/components/erp/CRMLeadList";
import { sortCRMLeads, crmLeadSortLabels, type CRMLeadSort } from "@/lib/crmLeadSort";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ACTIVE_CRM_STAGES, CRM_STAGES } from "@/lib/crmPipeline";
import { CRMLeadCard, type CRMLead as Lead } from "@/components/erp/CRMLeadCard";
import { CRMLeadDetail } from "@/components/erp/CRMLeadDetail";
import { useCRMInteractions } from "@/hooks/useCRMInteractions";
import { activityLabels } from "@/lib/crmActivity";
import { format } from "date-fns";
import { useSearchParams } from "@/lib/router-compat";

const leadSources = ["website", "configuratore", "chat", "referral", "social_media", "cold_call", "trade_show", "zapier", "other"];
const pipelines = ["Vesuviano"];
const activityTypes = ["call", "email", "meeting", "whatsapp", "demo", "follow_up"];

const kanbanStatuses = ACTIVE_CRM_STAGES;
const allStatuses = CRM_STAGES;

const emptyForm = {
  company_name: "",
  contact_name: "",
  email: "",
  phone: "",
  value: "",
  source: "",
  status: "nuovo",
  pipeline: "Vesuviano",
  notes: "",
  next_activity_type: "",
  next_activity_date: "",
  next_activity_notes: "",
  next_activity_assigned_to: "",
};

export default function ERPLeads() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedPipeline = "Vesuviano";
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [showClosed, setShowClosed] = useState(false);
  const [view, setView] = useState<"board" | "list">(() => (typeof window !== "undefined" && localStorage.getItem("crm-view") === "list" ? "list" : "board"));
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [sort, setSort] = useState<CRMLeadSort>(() => { const s = typeof window !== "undefined" ? localStorage.getItem("crm-sort") : null; return s && s in crmLeadSortLabels ? (s as CRMLeadSort) : "last_contact"; });
  useEffect(() => { localStorage.setItem("crm-view", view); localStorage.setItem("crm-sort", sort); }, [view, sort]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [savingActivity, setSavingActivity] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"riepilogo" | "comunicazioni" | "configuratore">("riepilogo");
  const linkedLeadId = searchParams.get("lead");
  useEffect(() => {
    if (!linkedLeadId || !leads.some(lead => lead.id === linkedLeadId)) return;
    setDetailTab("riepilogo");
    setDetailId(linkedLeadId);
  }, [linkedLeadId, leads]);
  const detailLead = leads.find((lead) => lead.id === detailId) ?? null;
  const openLead = (lead: Lead, tab: "riepilogo" | "comunicazioni" | "configuratore" = "riepilogo") => { setDetailTab(tab); setDetailId(lead.id); };
  const [form, setForm] = useState({ ...emptyForm });
  const { toast } = useToast();
  const { interactions, state: interactionState } = useCRMInteractions(leads);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const loadLeads = useCallback(async () => {
    try {
      const allLeads: Lead[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false })
          .order("id")
          .range(from, from + 999);
        if (error) throw error;
        allLeads.push(...((data || []) as unknown as Lead[]));
        if (!data || data.length < 1000) break;
      }
      setLeads(allLeads);
    } catch (error: any) {
      toast({ title: "Errore", description: "Impossibile caricare i lead: " + error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadUsers = useCallback(async () => {
    try {
      const { data: roles, error } = await supabase.from("user_roles").select("user_id");
      if (error) throw error;
      const userIds = [...new Set((roles || []).map((r: any) => r.user_id))];
      if (userIds.length === 0) return;
      const { data: emails, error: emailError } = await supabase.rpc("get_user_emails", { user_ids: userIds });
      if (emailError) throw emailError;
      setUsers((emails || []).map((e: any) => ({ id: e.user_id, email: e.email })));
    } catch (error: any) {
      console.error("Error loading users:", error.message);
    }
  }, []);

  useEffect(() => {
    loadLeads();
    loadUsers();
  }, [loadLeads, loadUsers]);

  const resetForm = () => setForm({ ...emptyForm, pipeline: selectedPipeline });

  const buildPayload = () => ({
    company_name: form.company_name || null,
    contact_name: form.contact_name || null,
    email: form.email || null,
    phone: form.phone || null,
    value: form.value ? parseFloat(form.value) : null,
    source: form.source || null,
    status: form.status,
    pipeline: form.pipeline || selectedPipeline,
    notes: form.notes || null,
    next_activity_type: form.next_activity_type || null,
    next_activity_date: form.next_activity_date ? new Date(form.next_activity_date).toISOString() : null,
    next_activity_notes: form.next_activity_notes || null,
    next_activity_assigned_to: form.next_activity_assigned_to || null,
  });

  const handleCreateLead = async () => {
    try {
      const { error } = await supabase.from("leads").insert([buildPayload()]);
      if (error) throw error;
      toast({ title: "Lead creato", description: "Il lead è stato creato con successo" });
      setIsDialogOpen(false);
      resetForm();
      await loadLeads();
    } catch (error: any) {
      toast({ title: "Errore", description: "Impossibile creare il lead: " + error.message, variant: "destructive" });
    }
  };

  const handleEditLead = (lead: Lead, activityOnly = false) => {
    setSelectedLead(lead);
    setForm({
      company_name: lead.company_name || "",
      contact_name: lead.contact_name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      value: lead.value ? lead.value.toString() : "",
      source: lead.source || "",
      status: lead.status,
      pipeline: lead.pipeline || "Vesuviano",
      notes: lead.notes || "",
      next_activity_type: lead.next_activity_type || "",
      next_activity_date: lead.next_activity_date ? format(new Date(lead.next_activity_date), "yyyy-MM-dd'T'HH:mm") : "",
      next_activity_notes: lead.next_activity_notes || "",
      next_activity_assigned_to: lead.next_activity_assigned_to || "",
    });
    if (activityOnly) setIsActivityDialogOpen(true);
    else setIsEditDialogOpen(true);
  };

  const handleSaveActivity = async () => {
    if (!selectedLead || savingActivity) return;
    if (!form.next_activity_type || !form.next_activity_date) {
      toast({ title: "Attività incompleta", description: "Seleziona il tipo e la data dell'attività", variant: "destructive" });
      return;
    }
    setSavingActivity(true);
    try {
      const payload = buildPayload();
      const { error } = await supabase.from("leads").update({
        next_activity_type: payload.next_activity_type,
        next_activity_date: payload.next_activity_date,
        next_activity_notes: payload.next_activity_notes,
        next_activity_assigned_to: payload.next_activity_assigned_to,
      }).eq("id", selectedLead.id);
      if (error) throw error;
      setIsActivityDialogOpen(false);
      toast({ title: "Attività salvata" });
      await loadLeads();
    } catch (error: any) {
      toast({ title: "Errore", description: "Impossibile salvare l'attività: " + error.message, variant: "destructive" });
    } finally {
      setSavingActivity(false);
    }
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;
    try {
      const { error } = await supabase.from("leads").update(buildPayload()).eq("id", selectedLead.id);
      if (error) throw error;
      toast({ title: "Lead aggiornato", description: "Il lead è stato aggiornato con successo" });
      setIsEditDialogOpen(false);
      setSelectedLead(null);
      resetForm();
      await loadLeads();
    } catch (error: any) {
      toast({ title: "Errore", description: "Impossibile aggiornare il lead: " + error.message, variant: "destructive" });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase.from("leads").delete().eq("id", leadId);
      if (error) throw error;
      toast({ title: "Lead eliminato", description: "Il lead è stato eliminato con successo" });
      await loadLeads();
    } catch (error: any) {
      toast({ title: "Errore", description: "Impossibile eliminare il lead: " + error.message, variant: "destructive" });
    }
  };

  const handleSetStatus = async (lead: Lead, status: "vinto" | "perso") => {
    try {
      const { error } = await supabase.from("leads").update({ status }).eq("id", lead.id);
      if (error) throw error;
      toast({ title: status === "vinto" ? "Lead vinto!" : "Lead perso", description: `Il lead è stato marcato come ${status}` });
      await loadLeads();
    } catch (error: any) {
      toast({ title: "Errore", description: "Impossibile aggiornare il lead: " + error.message, variant: "destructive" });
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    try {
      const { error } = await supabase.from("leads").update({ status: destination.droppableId }).eq("id", draggableId);
      if (error) throw error;
      setLeads((prev) => prev.map((l) => (l.id === draggableId ? { ...l, status: destination.droppableId } : l)));
      toast({ title: "Lead aggiornato", description: `Lead spostato in ${allStatuses.find((s) => s.id === destination.droppableId)?.title}` });
    } catch (error: any) {
      toast({ title: "Errore", description: "Impossibile aggiornare lo stato del lead", variant: "destructive" });
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = `${lead.company_name || ""} ${lead.contact_name || ""} ${lead.email || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPipeline = !selectedPipeline || lead.pipeline === selectedPipeline;
    const matchesCountry = selectedCountry === "all" || leadCountryFromPhone(lead.phone) === selectedCountry;
    return matchesSearch && matchesPipeline && matchesCountry;
  });

  const activeLeads = sortCRMLeads(filteredLeads.filter((lead) => kanbanStatuses.some((s) => s.id === lead.status)), sort, interactions);
  const closedLeads = sortCRMLeads(filteredLeads.filter((lead) => lead.status === "vinto" || lead.status === "perso"), sort, interactions);
  const listBase = stageFilter === "all" ? (showClosed ? sortCRMLeads(filteredLeads, sort, interactions) : activeLeads)
    : sortCRMLeads(filteredLeads.filter(l => l.status === stageFilter), sort, interactions);
  const listLeads = listBase;

  const leadsByStatus = kanbanStatuses.reduce((acc, status) => {
    acc[status.id] = activeLeads.filter((lead) => lead.status === status.id);
    return acc;
  }, {} as Record<string, Lead[]>);

  const totalLeads = filteredLeads.length;
  const recentLeads = filteredLeads.filter((lead) => {
    const createdDate = new Date(lead.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate > weekAgo;
  }).length;
  const totalValue = filteredLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
  const wonCount = filteredLeads.filter((l) => l.status === "vinto").length;

  const getUserEmail = (userId?: string) => users.find((u) => u.id === userId)?.email || "";

  const renderActivityFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="activity-type">Tipo</Label>
          <Select value={form.next_activity_type} onValueChange={value => setForm({ ...form, next_activity_type: value })}>
            <SelectTrigger id="activity-type"><SelectValue placeholder="Seleziona tipo" /></SelectTrigger>
            <SelectContent>{activityTypes.map(type => <SelectItem key={type} value={type}>{activityLabels[type] || type}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="activity-date">Data e ora</Label>
          <Input id="activity-date" type="datetime-local" value={form.next_activity_date} onChange={event => setForm({ ...form, next_activity_date: event.target.value })} />
        </div>
      </div>
      <div>
        <Label htmlFor="activity-notes">Note attività</Label>
        <Textarea id="activity-notes" value={form.next_activity_notes} onChange={event => setForm({ ...form, next_activity_notes: event.target.value })} />
      </div>
      <div>
        <Label htmlFor="activity-assignee">Assegnato a</Label>
        <Select value={form.next_activity_assigned_to} onValueChange={value => setForm({ ...form, next_activity_assigned_to: value })}>
          <SelectTrigger id="activity-assignee"><SelectValue placeholder="Seleziona utente" /></SelectTrigger>
          <SelectContent>{users.map(user => <SelectItem key={user.id} value={user.id}>{user.email}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderForm = (onSubmit: () => void, submitLabel: string) => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company_name">Ragione Sociale</Label>
          <Input id="company_name" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="contact_name">Nome Contatto</Label>
          <Input id="contact_name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="phone">Telefono</Label>
          <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="value">Valore (€)</Label>
          <Input id="value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="source">Fonte</Label>
          <Select value={form.source} onValueChange={(value) => setForm({ ...form, source: value })}>
            <SelectTrigger><SelectValue placeholder="Seleziona fonte" /></SelectTrigger>
            <SelectContent>
              {leadSources.map((source) => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Stato</Label>
          <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {allStatuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>{status.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="pipeline">Pipeline</Label>
          <Select value={form.pipeline} onValueChange={(value) => setForm({ ...form, pipeline: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {pipelines.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Note</Label>
        <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-sm">Prossima Attività</h4>
        {renderActivityFields()}
      </div>
      <Button onClick={onSubmit} className="w-full">{submitLabel}</Button>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full min-w-0 p-4 md:p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Caricamento lead...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">CRM</h1>
        </div>
        <Button className="shrink-0" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          { icon: TrendingUp, label: "Lead totali", value: totalLeads },
          { icon: Calendar, label: "Questa settimana", value: recentLeads },
          { icon: Trophy, label: "Tasso vittoria", value: `${totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0}%` },
          { icon: Building2, label: "Valore totale", value: `€${totalValue.toLocaleString("it-IT")}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex min-w-0 items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate text-xs text-muted-foreground">{label}</span>
            <span className="ml-auto text-base font-bold">{value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-full sm:basis-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cerca lead..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-9 pl-10" />
        </div>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="h-9 w-[170px]" aria-label="Paese"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i paesi</SelectItem>
            {leadCountries.map(c => <SelectItem key={c.code} value={c.code}>{c.code} · {c.label}</SelectItem>)}
            <SelectItem value="OTHER">Altri paesi</SelectItem>
          </SelectContent>
        </Select>
        {view === "list" && (
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="h-9 w-[170px]" aria-label="Fase"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le fasi</SelectItem>
              {CRM_STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Select value={sort} onValueChange={v => setSort(v as CRMLeadSort)}>
          <SelectTrigger className="h-9 w-[190px]" aria-label="Ordina per"><ArrowUpDown className="mr-1 h-3.5 w-3.5 shrink-0" /><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(crmLeadSortLabels) as CRMLeadSort[]).map(key => <SelectItem key={key} value={key}>{crmLeadSortLabels[key]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" className="h-9" variant={showClosed ? "default" : "outline"} onClick={() => setShowClosed(!showClosed)}>
          {showClosed ? "Nascondi chiusi" : `Mostra chiusi (${closedLeads.length})`}
        </Button>
        <ToggleGroup type="single" variant="outline" size="sm" value={view} onValueChange={v => v && setView(v as "board" | "list")} aria-label="Vista">
          <ToggleGroupItem value="board" aria-label="Vista board" className="h-9 gap-1.5"><LayoutGrid className="h-4 w-4" /><span className="hidden sm:inline">Board</span></ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Vista elenco" className="h-9 gap-1.5"><List className="h-4 w-4" /><span className="hidden sm:inline">Elenco</span></ToggleGroupItem>
        </ToggleGroup>
      </div>

      {view === "list" ? (
        <CRMLeadList leads={listLeads} interactions={interactions} interactionState={interactionState} now={now}
          sort={sort} onSort={setSort} onOpen={openLead} onConverse={lead => openLead(lead, "comunicazioni")} onSchedule={lead => handleEditLead(lead, true)} />
      ) : <>
      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div role="region" aria-label="Pipeline clienti" tabIndex={0} className="flex w-full min-w-0 max-w-full gap-3 overflow-x-auto pb-4">
          {kanbanStatuses.map((status) => (
            <div key={status.id} className="w-72 shrink-0 rounded-lg bg-muted/30 p-2.5">
              <div className="mb-2.5 flex items-center justify-between px-1">
                <h3 className="font-semibold text-sm">{status.title}</h3>
                <Badge variant="secondary" className={status.color}>
                  {leadsByStatus[status.id]?.length || 0}
                </Badge>
              </div>
              <Droppable droppableId={status.id}>
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className={`space-y-2 min-h-[200px] ${snapshot.isDraggingOver ? "bg-muted/50" : ""}`}>
                    {leadsByStatus[status.id]?.map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index} disableInteractiveElementBlocking>
                        {(provided, snapshot) => (
                          <CRMLeadCard
                            ref={provided.innerRef}
                            draggableProps={provided.draggableProps}
                            dragHandleProps={provided.dragHandleProps}
                            isDragging={snapshot.isDragging}
                            lead={lead}
                            activityAssignee={getUserEmail(lead.next_activity_assigned_to)}
                            lastInteraction={interactions[lead.id]}
                            interactionState={interactionState}
                            now={now}
                            onSchedule={lead => handleEditLead(lead, true)}
                            onOpen={openLead}
                            onConverse={lead => openLead(lead, "comunicazioni")}
                            onEdit={handleEditLead}
                            onDelete={handleDeleteLead}
                            onSetStatus={handleSetStatus}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Closed leads */}
      {showClosed && closedLeads.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Lead Chiusi</h2>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {closedLeads.map((lead) => (
              <CRMLeadCard key={lead.id} lead={lead}
                activityAssignee={getUserEmail(lead.next_activity_assigned_to)}
                lastInteraction={interactions[lead.id]} interactionState={interactionState} now={now}
                onSchedule={lead => handleEditLead(lead, true)}
                onOpen={openLead}
                onConverse={lead => openLead(lead, "comunicazioni")}
                onEdit={handleEditLead} onDelete={handleDeleteLead} onSetStatus={handleSetStatus} />
            ))}
          </div>
        </div>
      )}
      </>}

      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Pianifica attività</DialogTitle></DialogHeader>
          <p className="break-words text-sm text-muted-foreground">{selectedLead?.company_name || selectedLead?.contact_name || "Senza nome"}</p>
          {renderActivityFields()}
          <Button onClick={handleSaveActivity} disabled={savingActivity}>{savingActivity ? "Salvataggio…" : "Salva attività"}</Button>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuovo Lead</DialogTitle>
          </DialogHeader>
          {renderForm(handleCreateLead, "Crea Lead")}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifica Lead</DialogTitle>
          </DialogHeader>
          {renderForm(handleUpdateLead, "Salva Modifiche")}
        </DialogContent>
      </Dialog>
      <CRMLeadDetail lead={detailLead} open={!!detailLead} defaultTab={detailTab}
        onOpenChange={(open) => {
          if (open) return;
          setDetailId(null);
          if (linkedLeadId) setSearchParams(previous => { const next = new URLSearchParams(previous); next.delete("lead"); return next; }, { replace: true });
        }}
        onEdit={handleEditLead} onSchedule={lead => handleEditLead(lead, true)}
        onDelete={handleDeleteLead} onSetStatus={handleSetStatus} onUpdated={loadLeads}
        lastInteraction={detailLead ? interactions[detailLead.id] : null}
        activityAssignee={getUserEmail(detailLead?.next_activity_assigned_to)} />
    </div>
  );
}
