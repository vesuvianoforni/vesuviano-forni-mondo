import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, TrendingUp, Building2, Calendar, Trophy } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ACTIVE_CRM_STAGES, CRM_STAGES } from "@/lib/crmPipeline";
import { CRMLeadCard, type CRMLead as Lead } from "@/components/erp/CRMLeadCard";

const leadSources = ["website", "configuratore", "chat", "referral", "social_media", "cold_call", "trade_show", "zapier", "other"];
const pipelines = ["Vesuviano", "ZAPPER", "ZAPPER Pro"];
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
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPipeline, setSelectedPipeline] = useState<string>("Vesuviano");
  const [showClosed, setShowClosed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const { toast } = useToast();

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
        allLeads.push(...(data || []));
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

  const handleEditLead = (lead: Lead) => {
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
      next_activity_date: lead.next_activity_date ? new Date(lead.next_activity_date).toISOString().slice(0, 16) : "",
      next_activity_notes: lead.next_activity_notes || "",
      next_activity_assigned_to: lead.next_activity_assigned_to || "",
    });
    setIsEditDialogOpen(true);
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
    return matchesSearch && matchesPipeline;
  });

  const activeLeads = filteredLeads.filter((lead) => kanbanStatuses.some((s) => s.id === lead.status));
  const closedLeads = filteredLeads.filter((lead) => lead.status === "vinto" || lead.status === "perso");

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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo</Label>
            <Select value={form.next_activity_type} onValueChange={(value) => setForm({ ...form, next_activity_type: value })}>
              <SelectTrigger><SelectValue placeholder="Seleziona tipo" /></SelectTrigger>
              <SelectContent>
                {activityTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data e ora</Label>
            <Input type="datetime-local" value={form.next_activity_date} onChange={(e) => setForm({ ...form, next_activity_date: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Note attività</Label>
          <Textarea value={form.next_activity_notes} onChange={(e) => setForm({ ...form, next_activity_notes: e.target.value })} />
        </div>
        <div>
          <Label>Assegnato a</Label>
          <Select value={form.next_activity_assigned_to} onValueChange={(value) => setForm({ ...form, next_activity_assigned_to: value })}>
            <SelectTrigger><SelectValue placeholder="Seleziona utente" /></SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Lead Totali</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Questa Settimana</p>
                <p className="text-2xl font-bold">{recentLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tasso Vittoria</p>
                <p className="text-2xl font-bold">{totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Valore Totale</p>
                <p className="text-2xl font-bold">€{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-0 basis-full sm:basis-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cerca lead..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {pipelines.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant={showClosed ? "default" : "outline"} onClick={() => setShowClosed(!showClosed)}>
          {showClosed ? "Nascondi Chiusi" : `Mostra Chiusi (${closedLeads.length})`}
        </Button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div role="region" aria-label="Pipeline clienti" tabIndex={0} className="flex w-full min-w-0 max-w-full gap-4 overflow-x-auto pb-4">
          {kanbanStatuses.map((status) => (
            <div key={status.id} className="w-80 shrink-0 rounded-lg bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">{status.title}</h3>
                <Badge variant="secondary" className={status.color}>
                  {leadsByStatus[status.id]?.length || 0}
                </Badge>
              </div>
              <Droppable droppableId={status.id}>
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className={`space-y-3 min-h-[200px] ${snapshot.isDraggingOver ? "bg-muted/50" : ""}`}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {closedLeads.map((lead) => (
              <CRMLeadCard key={lead.id} lead={lead}
                activityAssignee={getUserEmail(lead.next_activity_assigned_to)}
                onEdit={handleEditLead} onDelete={handleDeleteLead} onSetStatus={handleSetStatus} />
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}
