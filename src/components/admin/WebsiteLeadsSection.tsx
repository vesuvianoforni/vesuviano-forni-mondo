import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Search, Mail, Phone, MapPin, Building, Globe, Eye, Trash2, RefreshCw,
  Flame, ArrowUpCircle, MinusCircle, ArrowDownCircle, Clock, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebsiteLead {
  id: string;
  created_at: string;
  form_type: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  company: string | null;
  website: string | null;
  oven_type: string | null;
  notes: string | null;
  metadata: any;
  status: string;
}

type Priority = 'high' | 'medium' | 'low';

const formTypeLabels: Record<string, string> = {
  'vesuvio-buono': 'Catalogo VesuvioBuono',
  'download-modal': 'Download AI',
  'ar-contact': 'AR Visualizer',
  'datasheet-download': 'Scheda Tecnica',
  'appointment': 'Prenotazione Chiamata',
  'consultation': 'Consulenza',
  'contact': 'Contatto'
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-yellow-500',
  qualified: 'bg-green-500',
  not_interested: 'bg-red-500'
};

const statusLabels: Record<string, string> = {
  new: 'Nuovo',
  contacted: 'Contattato',
  qualified: 'Qualificato',
  not_interested: 'Non Interessato'
};

const priorityConfig: Record<Priority, {
  label: string; icon: React.ElementType; cardClass: string; badgeClass: string; rank: number;
}> = {
  high:   { label: 'Alta',  icon: Flame,            rank: 0,
    cardClass: 'border-l-4 border-l-red-500 hover:shadow-red-500/20',
    badgeClass: 'bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400' },
  medium: { label: 'Media', icon: MinusCircle,      rank: 1,
    cardClass: 'border-l-4 border-l-amber-500 hover:shadow-amber-500/20',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400' },
  low:    { label: 'Bassa', icon: ArrowDownCircle,  rank: 2,
    cardClass: 'border-l-4 border-l-slate-300 hover:shadow-slate-400/20',
    badgeClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:text-slate-400' },
};

const getPriority = (lead: WebsiteLead): Priority => {
  const p = lead.metadata?.priority;
  return (p === 'high' || p === 'medium' || p === 'low') ? p : 'medium';
};

export const WebsiteLeadsSection = () => {
  const [leads, setLeads] = useState<WebsiteLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<WebsiteLead | null>(null);

  useEffect(() => { loadLeads(); }, []);

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('website_leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error loading website leads:', error);
      toast.error('Errore nel caricamento dei lead');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('website_leads').update({ status: newStatus }).eq('id', leadId);
      if (error) throw error;
      toast.success('Stato aggiornato');
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (error) {
      console.error(error);
      toast.error('Errore aggiornamento stato');
    }
  };

  const updateLeadPriority = async (lead: WebsiteLead, newPriority: Priority) => {
    try {
      const newMeta = { ...(lead.metadata || {}), priority: newPriority };
      const { error } = await supabase.from('website_leads').update({ metadata: newMeta }).eq('id', lead.id);
      if (error) throw error;
      toast.success(`Priorità: ${priorityConfig[newPriority].label}`);
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, metadata: newMeta } : l));
      if (selectedLead?.id === lead.id) setSelectedLead({ ...lead, metadata: newMeta });
    } catch (error) {
      console.error(error);
      toast.error('Errore aggiornamento priorità');
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm('Eliminare questo lead?')) return;
    try {
      const { error } = await supabase.from('website_leads').delete().eq('id', leadId);
      if (error) throw error;
      toast.success('Lead eliminato');
      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (error) {
      console.error(error);
      toast.error('Errore eliminazione');
    }
  };

  const filteredLeads = useMemo(() => {
    const filtered = leads.filter(lead => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        lead.first_name?.toLowerCase().includes(term) ||
        lead.last_name?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.phone?.includes(searchTerm) ||
        lead.city?.toLowerCase().includes(term) ||
        lead.company?.toLowerCase().includes(term);
      const matchesFormType = formTypeFilter === 'all' || lead.form_type === formTypeFilter;
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || getPriority(lead) === priorityFilter;
      return matchesSearch && matchesFormType && matchesStatus && matchesPriority;
    });
    // Sort: priority asc (high first), then created_at desc
    return filtered.sort((a, b) => {
      const pa = priorityConfig[getPriority(a)].rank;
      const pb = priorityConfig[getPriority(b)].rank;
      if (pa !== pb) return pa - pb;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [leads, searchTerm, formTypeFilter, statusFilter, priorityFilter]);

  const uniqueFormTypes = [...new Set(leads.map(l => l.form_type))];

  const totalLeads = leads.length;
  const highCount = leads.filter(l => getPriority(l) === 'high').length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Website Lead</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website Lead CRM
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadLeads}>
            <RefreshCw className="h-4 w-4 mr-2" /> Aggiorna
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setPriorityFilter('high')}
              className={cn(
                "text-left p-4 rounded-lg border-l-4 border-l-red-500 bg-red-500/5 hover:bg-red-500/10 transition",
                priorityFilter === 'high' && 'ring-2 ring-red-500/40'
              )}
            >
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Flame className="h-4 w-4" />
                <span className="text-2xl font-bold">{highCount}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Priorità Alta</div>
            </button>
            <div className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-500/5">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{newLeads}</div>
              <div className="text-xs text-muted-foreground mt-1">Nuovi</div>
            </div>
            <div className="p-4 rounded-lg border-l-4 border-l-green-500 bg-green-500/5">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{qualifiedLeads}</div>
              <div className="text-xs text-muted-foreground mt-1">Qualificati</div>
            </div>
            <div className="p-4 rounded-lg border-l-4 border-l-muted-foreground/40 bg-muted/40">
              <div className="text-2xl font-bold">{totalLeads}</div>
              <div className="text-xs text-muted-foreground mt-1">Totale</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, email, telefono, città..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Priorità" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte priorità</SelectItem>
                <SelectItem value="high">🔥 Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Bassa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Tipo form" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i form</SelectItem>
                {uniqueFormTypes.map(type => (
                  <SelectItem key={type} value={type}>{formTypeLabels[type] || type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Stato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="new">Nuovo</SelectItem>
                <SelectItem value="contacted">Contattato</SelectItem>
                <SelectItem value="qualified">Qualificato</SelectItem>
                <SelectItem value="not_interested">Non Interessato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cards Grid */}
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              {leads.length === 0 ? 'Nessun lead ancora registrato' : 'Nessun lead corrisponde ai filtri'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredLeads.map((lead) => {
                const priority = getPriority(lead);
                const pConf = priorityConfig[priority];
                const PIcon = pConf.icon;
                const name = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'Senza nome';
                return (
                  <div
                    key={lead.id}
                    className={cn(
                      'group bg-card rounded-lg border shadow-sm hover:shadow-md transition-all p-4 flex flex-col gap-3',
                      pConf.cardClass
                    )}
                  >
                    {/* Header: Priority + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <Select value={priority} onValueChange={(v) => updateLeadPriority(lead, v as Priority)}>
                        <SelectTrigger className={cn('h-7 px-2 text-xs w-auto gap-1 border', pConf.badgeClass)}>
                          <PIcon className="h-3.5 w-3.5" />
                          <span className="font-semibold">{pConf.label}</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">🔥 Alta</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="low">Bassa</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={lead.status} onValueChange={(v) => updateLeadStatus(lead.id, v)}>
                        <SelectTrigger className="h-7 px-2 text-xs w-auto gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${statusColors[lead.status] || 'bg-gray-400'}`} />
                          <span>{statusLabels[lead.status] || lead.status}</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Nuovo</SelectItem>
                          <SelectItem value="contacted">Contattato</SelectItem>
                          <SelectItem value="qualified">Qualificato</SelectItem>
                          <SelectItem value="not_interested">Non Interessato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Name + Form type */}
                    <div className="space-y-1">
                      <h3 className="font-semibold text-base leading-tight truncate">{name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                          {formTypeLabels[lead.form_type] || lead.form_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(lead.created_at), { locale: it, addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Contacts */}
                    <div className="space-y-1.5 text-sm flex-1">
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-primary hover:underline truncate">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </a>
                      )}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-2 hover:underline">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span>{lead.phone}</span>
                        </a>
                      )}
                      {lead.city && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{lead.city}</span>
                        </div>
                      )}
                      {lead.company && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{lead.company}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-2 border-t">
                      <Button variant="outline" size="sm" className="flex-1 h-8" onClick={() => setSelectedLead(lead)}>
                        <Eye className="h-3.5 w-3.5 mr-1.5" /> Dettagli
                      </Button>
                      {lead.phone && (
                        <Button asChild variant="outline" size="sm" className="h-8 px-2">
                          <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                            <MessageSquare className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteLead(lead.id)}
                        aria-label="Elimina"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Dettagli Lead — {[selectedLead?.first_name, selectedLead?.last_name].filter(Boolean).join(' ') || 'N/A'}
            </DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Select value={getPriority(selectedLead)} onValueChange={(v) => updateLeadPriority(selectedLead, v as Priority)}>
                  <SelectTrigger className={cn('h-9 w-auto gap-2 border', priorityConfig[getPriority(selectedLead)].badgeClass)}>
                    <Flame className="h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔥 Priorità Alta</SelectItem>
                    <SelectItem value="medium">Priorità Media</SelectItem>
                    <SelectItem value="low">Priorità Bassa</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedLead.status} onValueChange={(v) => { updateLeadStatus(selectedLead.id, v); setSelectedLead({ ...selectedLead, status: v }); }}>
                  <SelectTrigger className="h-9 w-auto gap-2">
                    <div className={`h-2 w-2 rounded-full ${statusColors[selectedLead.status] || 'bg-gray-400'}`} />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nuovo</SelectItem>
                    <SelectItem value="contacted">Contattato</SelectItem>
                    <SelectItem value="qualified">Qualificato</SelectItem>
                    <SelectItem value="not_interested">Non Interessato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Tipo Form</div>
                  <div className="font-medium">{formTypeLabels[selectedLead.form_type] || selectedLead.form_type}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Data</div>
                  <div className="font-medium">{format(new Date(selectedLead.created_at), 'dd MMM yyyy HH:mm', { locale: it })}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="font-medium break-all">{selectedLead.email || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Telefono</div>
                  <div className="font-medium">{selectedLead.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Città</div>
                  <div className="font-medium">{selectedLead.city || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Azienda</div>
                  <div className="font-medium">{selectedLead.company || '-'}</div>
                </div>
              </div>

              {selectedLead.oven_type && (
                <div>
                  <div className="text-xs text-muted-foreground">Tipologia Forno</div>
                  <div className="font-medium">{selectedLead.oven_type}</div>
                </div>
              )}
              {selectedLead.website && (
                <div>
                  <div className="text-xs text-muted-foreground">Sito Web</div>
                  <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {selectedLead.website}
                  </a>
                </div>
              )}
              {selectedLead.notes && (
                <div>
                  <div className="text-xs text-muted-foreground">Note</div>
                  <div className="font-medium whitespace-pre-wrap">{selectedLead.notes}</div>
                </div>
              )}
              {selectedLead.metadata && Object.keys(selectedLead.metadata).length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Dati Originali</div>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-48">
                    {JSON.stringify(selectedLead.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
