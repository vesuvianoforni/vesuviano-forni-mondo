import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Search, Mail, Phone, MapPin, Building, Globe, Eye, Trash2, RefreshCw } from 'lucide-react';

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

const formTypeLabels: Record<string, string> = {
  'vesuvio-buono': 'Download Catalogo VesuvioBuono',
  'download-modal': 'Download Immagine AI',
  'ar-contact': 'Contatto AR Visualizer',
  'datasheet-download': 'Scheda Tecnica',
  'appointment': 'Prenotazione Chiamata',
  'consultation': 'Richiesta Consulenza',
  'contact': 'Contatto Generico'
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

export const WebsiteLeadsSection = () => {
  const [leads, setLeads] = useState<WebsiteLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<WebsiteLead | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

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
      const { error } = await supabase
        .from('website_leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      toast.success('Stato aggiornato');
      loadLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Errore nell\'aggiornamento dello stato');
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo lead?')) return;

    try {
      const { error } = await supabase
        .from('website_leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      toast.success('Lead eliminato');
      loadLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Errore nell\'eliminazione del lead');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFormType = formTypeFilter === 'all' || lead.form_type === formTypeFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesFormType && matchesStatus;
  });

  // Get unique form types from leads
  const uniqueFormTypes = [...new Set(leads.map(lead => lead.form_type))];

  // KPI calculations
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const contactedLeads = leads.filter(l => l.status === 'contacted').length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Website Lead</CardTitle>
        </CardHeader>
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
            Website Lead ({totalLeads})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadLeads}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">{newLeads}</div>
              <div className="text-sm text-muted-foreground">Nuovi</div>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <div className="text-2xl font-bold text-secondary-foreground">{contactedLeads}</div>
              <div className="text-sm text-muted-foreground">Contattati</div>
            </div>
            <div className="bg-accent p-4 rounded-lg">
              <div className="text-2xl font-bold text-accent-foreground">{qualifiedLeads}</div>
              <div className="text-sm text-muted-foreground">Qualificati</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-2xl font-bold">{totalLeads}</div>
              <div className="text-sm text-muted-foreground">Totale</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, email, telefono, città..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i form</SelectItem>
                {uniqueFormTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {formTypeLabels[type] || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="new">Nuovo</SelectItem>
                <SelectItem value="contacted">Contattato</SelectItem>
                <SelectItem value="qualified">Qualificato</SelectItem>
                <SelectItem value="not_interested">Non Interessato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo Form</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contatti</TableHead>
                  <TableHead>Località</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {leads.length === 0 ? 'Nessun lead ancora registrato' : 'Nessun lead corrisponde ai filtri'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(lead.created_at), 'dd/MM/yy HH:mm', { locale: it })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {formTypeLabels[lead.form_type] || lead.form_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {[lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'N/A'}
                        </div>
                        {lead.company && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building className="h-3 w-3" /> {lead.company}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                              {lead.email}
                            </a>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <a href={`tel:${lead.phone}`} className="hover:underline">
                              {lead.phone}
                            </a>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.city && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {lead.city}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(value) => updateLeadStatus(lead.id, value)}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${statusColors[lead.status] || 'bg-gray-400'}`} />
                              <span className="text-xs">{statusLabels[lead.status] || lead.status}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Nuovo</SelectItem>
                            <SelectItem value="contacted">Contattato</SelectItem>
                            <SelectItem value="qualified">Qualificato</SelectItem>
                            <SelectItem value="not_interested">Non Interessato</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLead(lead.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Lead Detail Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Dettagli Lead - {[selectedLead?.first_name, selectedLead?.last_name].filter(Boolean).join(' ') || 'N/A'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Tipo Form</div>
                  <div className="font-medium">{formTypeLabels[selectedLead.form_type] || selectedLead.form_type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Data</div>
                  <div className="font-medium">
                    {format(new Date(selectedLead.created_at), 'dd MMMM yyyy HH:mm', { locale: it })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Nome</div>
                  <div className="font-medium">{selectedLead.first_name || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Cognome</div>
                  <div className="font-medium">{selectedLead.last_name || '-'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">
                    {selectedLead.email ? (
                      <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline">
                        {selectedLead.email}
                      </a>
                    ) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Telefono</div>
                  <div className="font-medium">
                    {selectedLead.phone ? (
                      <a href={`tel:${selectedLead.phone}`} className="hover:underline">
                        {selectedLead.phone}
                      </a>
                    ) : '-'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Città</div>
                  <div className="font-medium">{selectedLead.city || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Azienda</div>
                  <div className="font-medium">{selectedLead.company || '-'}</div>
                </div>
              </div>

              {selectedLead.oven_type && (
                <div>
                  <div className="text-sm text-muted-foreground">Tipologia Forno</div>
                  <div className="font-medium">{selectedLead.oven_type}</div>
                </div>
              )}

              {selectedLead.website && (
                <div>
                  <div className="text-sm text-muted-foreground">Sito Web</div>
                  <div className="font-medium">
                    <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {selectedLead.website}
                    </a>
                  </div>
                </div>
              )}

              {selectedLead.notes && (
                <div>
                  <div className="text-sm text-muted-foreground">Note</div>
                  <div className="font-medium">{selectedLead.notes}</div>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground mb-2">Stato</div>
                <Select
                  value={selectedLead.status}
                  onValueChange={(value) => {
                    updateLeadStatus(selectedLead.id, value);
                    setSelectedLead({ ...selectedLead, status: value });
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${statusColors[selectedLead.status] || 'bg-gray-400'}`} />
                      {statusLabels[selectedLead.status] || selectedLead.status}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nuovo</SelectItem>
                    <SelectItem value="contacted">Contattato</SelectItem>
                    <SelectItem value="qualified">Qualificato</SelectItem>
                    <SelectItem value="not_interested">Non Interessato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedLead.metadata && Object.keys(selectedLead.metadata).length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Dati Originali Form</div>
                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-48">
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
