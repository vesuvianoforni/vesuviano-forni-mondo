import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import InitConfiguratorData from '@/components/InitConfiguratorData';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EditOvenModal from '@/components/admin/EditOvenModal';
import { AddOvenModal } from '@/components/admin/AddOvenModal';
import EditOptionModal from '@/components/admin/EditOptionModal';
import AddOptionModal from '@/components/admin/AddOptionModal';
import { AIConversionMessageModal } from '@/components/admin/AIConversionMessageModal';
import { WebsiteLeadsSection } from '@/components/admin/WebsiteLeadsSection';
import { LogOut, Edit, Plus, Trash2, TrendingUp, Users, CheckCircle, Clock, ArrowRight, Search, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Input } from '@/components/ui/input';

const AdminConfigurator = () => {
  const navigate = useNavigate();
  const [ovens, setOvens] = useState([]);
  const [options, setOptions] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOven, setEditingOven] = useState<any>(null);
  const [showAddOven, setShowAddOven] = useState(false);
  const [editingOption, setEditingOption] = useState<any>(null);
  const [showAddOption, setShowAddOption] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      const [ovensResult, optionsResult, quotesResult, sessionsResult] = await Promise.all([
        supabase.from('configurator_ovens').select('*').order('created_at', { ascending: false }),
        supabase.from('configurator_options').select('*').order('created_at', { ascending: false }),
        supabase.from('configurator_quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('configurator_sessions').select(`
          *,
          configurator_quotes (
            id,
            total_price,
            status,
            payment_completed
          )
        `).order('created_at', { ascending: false })
      ]);
      setOvens(ovensResult.data || []);
      setOptions(optionsResult.data || []);
      setQuotes(quotesResult.data || []);
      setSessions(sessionsResult.data || []);
    } catch (error) {
      toast.error('Errore caricamento');
    } finally {
      setLoading(false);
    }
  };

  // Calcola KPI
  const totalSessions = sessions.length;
  const openedSessions = sessions.filter(s => s.is_used).length;
  const paidOrders = sessions.filter(s => s.configurator_quotes?.payment_completed).length;
  const interestedSessions = sessions.filter(s => s.status === 'interested' || s.feedback_status === 'interested').length;
  
  const openRate = totalSessions > 0 ? ((openedSessions / totalSessions) * 100).toFixed(1) : '0';
  const conversionRate = openedSessions > 0 ? ((paidOrders / openedSessions) * 100).toFixed(1) : '0';

  // Filtra le sessioni in base al termine di ricerca
  const filteredSessions = sessions.filter((session: any) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const name = session.customer_name?.toLowerCase() || '';
    const email = session.customer_email?.toLowerCase() || '';
    const phone = session.customer_phone?.toLowerCase() || '';
    
    return name.includes(search) || email.includes(search) || phone.includes(search);
  });

  // Ultime 5 interazioni (dopo il filtro)
  const recentSessions = filteredSessions.slice(0, 5);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleDeleteOven = async (ovenId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo forno?')) return;

    try {
      // Prima eliminiamo eventuali preventivi collegati a questo forno per evitare errori di vincoli
      const { error: quotesError } = await supabase
        .from('configurator_quotes')
        .delete()
        .eq('oven_id', ovenId);

      if (quotesError) throw quotesError;

      const { error: ovenError } = await supabase
        .from('configurator_ovens')
        .delete()
        .eq('id', ovenId);

      if (ovenError) throw ovenError;

      toast.success('Forno eliminato con successo');
      fetchData();
    } catch (error) {
      console.error('Errore eliminazione forno:', error);
      toast.error('Errore durante l\'eliminazione del forno');
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa opzione?')) return;

    try {
      const { error } = await supabase
        .from('configurator_options')
        .delete()
        .eq('id', optionId);

      if (error) throw error;

      toast.success('Opzione eliminata con successo');
      fetchData();
    } catch (error) {
      console.error('Errore eliminazione opzione:', error);
      toast.error('Errore durante l\'eliminazione dell\'opzione');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestione Configuratore</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Link Generati</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{totalSessions}</div>
            </div>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasso Apertura</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{openRate}%</div>
              <p className="text-xs text-muted-foreground">{openedSessions} su {totalSessions}</p>
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordini Pagati</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{paidOrders}</div>
              <p className="text-xs text-muted-foreground">Conv. {conversionRate}%</p>
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interessati</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{interestedSessions}</div>
            </div>
          </Card>
        </div>

        {/* Ultime Interazioni */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ultime Interazioni</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/admin/proforma')} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Pro-Forma
              </Button>
              <Button onClick={() => navigate('/admin/sessions-crm')} variant="outline" size="sm">
                Visualizza CRM Completo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cerca per nome, email o telefono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Data Creazione</TableHead>
                <TableHead>Ultimo Accesso</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSessions.map((session: any) => {
                const getStatusLabel = () => {
                  if (session.configurator_quotes?.payment_completed) return 'Pagato';
                  if (session.status === 'payment_initiated') return 'Pagamento Avviato';
                  if (session.status === 'interested' || session.feedback_status === 'interested') return 'Interessato';
                  if (session.feedback_status === 'not_interested') return 'Non Interessato';
                  if (session.is_used) return 'Aperto';
                  return 'Nuovo';
                };

                const getStatusVariant = () => {
                  if (session.configurator_quotes?.payment_completed) return 'default';
                  if (session.status === 'payment_initiated') return 'default';
                  if (session.status === 'interested' || session.feedback_status === 'interested') return 'secondary';
                  if (session.feedback_status === 'not_interested') return 'destructive';
                  if (session.is_used) return 'secondary';
                  return 'outline';
                };

                return (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      <div>{session.customer_name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">{session.customer_email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant() as any}>{getStatusLabel()}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(session.created_at), 'dd/MM/yy HH:mm', { locale: it })}</TableCell>
                    <TableCell>
                      {session.last_opened_at 
                        ? format(new Date(session.last_opened_at), 'dd/MM/yy HH:mm', { locale: it })
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {session.customer_email && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedSessionId(session.id);
                            setAiModalOpen(true);
                          }}
                          title="Genera messaggio AI di conversione"
                        >
                          <Sparkles className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {recentSessions.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Nessuna sessione ancora creata
            </div>
          )}
        </Card>

        {/* Website Leads Section */}
        <div className="mb-8">
          <WebsiteLeadsSection />
        </div>

        {ovens.length === 0 && <InitConfiguratorData />}
        <Tabs defaultValue="ovens">
          <TabsList className="mb-6">
            <TabsTrigger value="ovens">Forni ({ovens.length})</TabsTrigger>
            <TabsTrigger value="options">Opzioni ({options.length})</TabsTrigger>
            <TabsTrigger value="quotes">Preventivi ({quotes.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="ovens">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Forni Configurabili</CardTitle>
                <Button onClick={() => setShowAddOven(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Forno
                </Button>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Immagine</TableHead>
                    <TableHead>Modello</TableHead>
                    <TableHead>Alimentazione</TableHead>
                    <TableHead>Configurazioni</TableHead>
                    <TableHead>Prezzo Base (Lista A)</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ovens.map((oven: any) => {
                    // Calcola il prezzo dalla nuova struttura
                    const getBasePrice = () => {
                      if (oven.sizes && oven.sizes.length > 0 && oven.sizes[0].coatings && oven.sizes[0].coatings.length > 0) {
                        return oven.sizes[0].coatings[0].prices?.listA?.base || 0;
                      }
                      return oven.base_price_a || 0;
                    };

                    // Formatta le configurazioni disponibili
                    const getSizesInfo = () => {
                      if (oven.sizes && oven.sizes.length > 0) {
                        if (oven.sizes.length === 1) {
                          return `${oven.sizes[0].diameter}cm (${oven.sizes[0].pizza_capacity})`;
                        }
                        return `${oven.sizes.length} taglie`;
                      }
                      return `${oven.diameter}cm (${oven.pizza_capacity})`;
                    };

                    return (
                      <TableRow key={oven.id}>
                        <TableCell>
                          {oven.image_url && (
                            <img src={oven.image_url} alt={oven.model_name} className="w-16 h-16 object-cover rounded" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{oven.model_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(oven.fuel_type) ? (
                              oven.fuel_type.filter(f => f).map((fuel, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {fuel}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getSizesInfo()}</TableCell>
                        <TableCell className="font-medium">€{getBasePrice().toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={oven.is_active ? 'default' : 'secondary'}>
                            {oven.is_active ? 'Attivo' : 'Inattivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setEditingOven(oven)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteOven(oven.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          <TabsContent value="options">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Opzioni Disponibili</CardTitle>
                <Button onClick={() => setShowAddOption(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Opzione
                </Button>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Diametro</TableHead>
                    <TableHead>Prezzo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {options.map((opt: any) => (
                    <TableRow key={opt.id}>
                      <TableCell>{opt.name}</TableCell>
                      <TableCell>{opt.type}</TableCell>
                      <TableCell>
                        {opt.diameter ? (
                          <Badge variant="outline">{opt.diameter}cm</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Tutti</span>
                        )}
                      </TableCell>
                      <TableCell>€{opt.price}</TableCell>
                      <TableCell>
                        <Badge variant={opt.is_active ? 'default' : 'secondary'}>
                          {opt.is_active ? 'Attivo' : 'Inattivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditingOption(opt)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteOption(opt.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          <TabsContent value="quotes">
            <Card>
              <CardHeader><CardTitle>Preventivi Ricevuti</CardTitle></CardHeader>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Data</TableHead><TableHead>Cliente</TableHead><TableHead>Totale</TableHead><TableHead>Stato</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote: any) => (
                    <TableRow key={quote.id}>
                      <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{quote.customer_name || 'N/A'}</TableCell>
                      <TableCell>€{quote.total_price}</TableCell>
                      <TableCell><Badge>{quote.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {editingOven && (
        <EditOvenModal
          oven={editingOven}
          open={!!editingOven}
          onClose={() => setEditingOven(null)}
          onUpdate={fetchData}
        />
      )}
      {showAddOven && (
        <AddOvenModal
          open={showAddOven}
          onClose={() => setShowAddOven(false)}
          onSuccess={fetchData}
        />
      )}
      {editingOption && (
        <EditOptionModal
          option={editingOption}
          open={!!editingOption}
          onClose={() => setEditingOption(null)}
          onUpdate={fetchData}
        />
      )}
      {showAddOption && (
        <AddOptionModal
          open={showAddOption}
          onClose={() => setShowAddOption(false)}
          onSuccess={fetchData}
        />
      )}
      
      <AIConversionMessageModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        sessionId={selectedSessionId}
        language="it"
      />
    </div>
  );
};

export default AdminConfigurator;