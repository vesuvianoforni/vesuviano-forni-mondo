import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, RefreshCw, ArrowLeft, Check, X, Clock, Package, Plus, LayoutList, LayoutGrid, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface SessionData {
  id: string;
  token: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  price_list: string;
  status: string;
  feedback_status: string | null;
  feedback_reason: string | null;
  created_at: string;
  is_used: boolean;
  last_opened_at: string | null;
  customer_actions: any[];
  quote_id: string | null;
  configurator_quotes?: {
    id: string;
    total_price: number;
    status: string;
    payment_completed: boolean | null;
  } | null;
}

const SessionsCRM = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [priceList, setPriceList] = useState('A');
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('configurator_sessions')
        .select(`
          *,
          configurator_quotes (
            id,
            total_price,
            status,
            payment_completed
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data as SessionData[]);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Errore nel caricamento delle sessioni');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/configuratore/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiato!');
  };

  const regenerateLink = async (sessionId: string) => {
    if (!confirm('Rigenerare il link? Il vecchio link non funzionerà più.')) return;

    try {
      const newToken = generateToken();
      const { error } = await supabase
        .from('configurator_sessions')
        .update({ 
          token: newToken,
          is_used: false,
          last_opened_at: null,
          customer_actions: []
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Link rigenerato!');
      loadSessions();
    } catch (error) {
      console.error('Error regenerating link:', error);
      toast.error('Errore nella rigenerazione del link');
    }
  };

  const sendEmailToCustomer = async (session: SessionData) => {
    try {
      const configuratorLink = `${window.location.origin}/configuratore/${session.token}`;
      
      toast.loading('Invio email in corso...');

      const { data, error } = await supabase.functions.invoke('send-configurator-link', {
        body: {
          customerName: session.customer_name,
          customerEmail: session.customer_email,
          configuratorLink: configuratorLink,
          priceList: session.price_list
        }
      });

      if (error) throw error;

      toast.dismiss();
      toast.success(`Email inviata con successo a ${session.customer_email}!`);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.dismiss();
      toast.error('Errore nell\'invio dell\'email. Riprova più tardi.');
    }
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const generateNewLink = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      toast.error('Compila tutti i campi del cliente');
      return;
    }

    try {
      const token = generateToken();
      const { error } = await supabase
        .from('configurator_sessions')
        .insert({
          token,
          status: 'draft',
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          price_list: priceList
        });

      if (error) throw error;

      const link = `${window.location.origin}/configuratore/${token}`;
      await navigator.clipboard.writeText(link);
      
      toast.success('Link generato e copiato negli appunti!');
      setShowNewLinkForm(false);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setPriceList('A');
      loadSessions();
    } catch (error) {
      console.error('Error generating link:', error);
      toast.error('Errore nella generazione del link');
    }
  };

  const getStatusBadge = (session: SessionData, compact = false) => {
    if (session.configurator_quotes?.payment_completed) {
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white">
          <Package className="w-3 h-3 mr-1" />
          Pagato
        </Badge>
      );
    }
    if (session.status === 'payment_initiated') {
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
          <Clock className="w-3 h-3 mr-1" />
          Pagamento Avviato
        </Badge>
      );
    }
    if (session.status === 'interested' || session.feedback_status === 'interested') {
      return (
        <Badge className="bg-orange-600 hover:bg-orange-700 text-white">
          Interessato
        </Badge>
      );
    }
    if (session.feedback_status === 'not_interested') {
      return (
        <Badge variant="destructive">
          <X className="w-3 h-3 mr-1" />
          Non Interessato
        </Badge>
      );
    }
    if (session.is_used) {
      return (
        <Badge className="bg-stone-600 hover:bg-stone-700 text-white">
          Aperto
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-background">
        Nuovo
      </Badge>
    );
  };

  const getActivitySummary = (session: SessionData) => {
    const actions = session.customer_actions || [];
    if (actions.length === 0 && !session.is_used) {
      return <span className="text-sm text-muted-foreground">Nessuna attività</span>;
    }

    const summary: string[] = [];
    if (session.is_used) {
      summary.push(`Aperto ${session.last_opened_at ? format(new Date(session.last_opened_at), 'dd/MM/yy HH:mm', { locale: it }) : ''}`);
    }
    
    const actionTypes = new Set(actions.map((a: any) => a.type));
    if (actionTypes.has('model_selected')) summary.push('Ha selezionato un modello');
    if (actionTypes.has('fuel_selected')) summary.push('Ha scelto alimentazione');
    if (actionTypes.has('size_selected')) summary.push('Ha scelto dimensione');
    if (actionTypes.has('coating_selected')) summary.push('Ha scelto rivestimento');
    if (actionTypes.has('color_render_generated')) summary.push('Ha generato render colore');
    if (actionTypes.has('architect_ai_used')) summary.push('Ha usato Architetto AI');

    return (
      <div className="text-sm text-muted-foreground space-y-1">
        {summary.map((item, idx) => (
          <div key={idx}>• {item}</div>
        ))}
      </div>
    );
  };

  const groupSessionsByStatus = () => {
    const groups = {
      nuovo: sessions.filter(s => !s.is_used),
      aperto: sessions.filter(s => s.is_used && !s.feedback_status && s.status !== 'payment_initiated' && !s.configurator_quotes?.payment_completed),
      interessato: sessions.filter(s => (s.status === 'interested' || s.feedback_status === 'interested') && !s.configurator_quotes?.payment_completed),
      pagamento: sessions.filter(s => s.status === 'payment_initiated' && !s.configurator_quotes?.payment_completed),
      pagato: sessions.filter(s => s.configurator_quotes?.payment_completed),
      nonInteressato: sessions.filter(s => s.feedback_status === 'not_interested')
    };
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  const kanbanGroups = groupSessionsByStatus();

  const renderSessionCard = (session: SessionData, compact = false) => {
    if (compact) {
      // Compact kanban card
      return (
        <Card 
          key={session.id} 
          className="hover:shadow-lg transition-all border-l-4 cursor-pointer" 
          onClick={() => setSelectedSession(session)}
          style={{
          borderLeftColor: session.configurator_quotes?.payment_completed ? '#16a34a' : 
                           session.status === 'payment_initiated' ? '#2563eb' :
                           session.status === 'interested' || session.feedback_status === 'interested' ? '#ea580c' :
                           session.feedback_status === 'not_interested' ? '#dc2626' :
                           session.is_used ? '#57534e' : '#e5e7eb'
        }}>
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header with status and price list */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  {getStatusBadge(session, true)}
                  <Badge variant="outline" className="w-fit text-xs">
                    Listino {session.price_list}
                  </Badge>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      sendEmailToCustomer(session);
                    }}
                    title="Invia email"
                    className="h-8 w-8 p-0"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyLink(session.token);
                    }}
                    title="Copia link"
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      regenerateLink(session.id);
                    }}
                    title="Rigenera link"
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Customer info */}
              <div className="min-w-0">
                <h4 className="font-semibold text-sm truncate">{session.customer_name || 'Nome non disponibile'}</h4>
                <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                  {session.customer_email && (
                    <div className="truncate" title={session.customer_email}>{session.customer_email}</div>
                  )}
                  {session.customer_phone && <div>{session.customer_phone}</div>}
                </div>
              </div>

              {/* Date info */}
              <div className="text-xs text-muted-foreground">
                <div>Creato: {format(new Date(session.created_at), 'dd/MM/yy HH:mm', { locale: it })}</div>
              </div>

              {/* Link status indicator */}
              {session.is_used && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
                  <Check className="w-3 h-3" />
                  Link utilizzato
                </div>
              )}

              {/* Order info for paid */}
              {session.configurator_quotes && (
                <div className="text-xs bg-muted/50 px-2 py-1.5 rounded">
                  <span className="font-medium">Ordine: </span>
                  €{session.configurator_quotes.total_price.toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Full list card
    return (
      <Card 
        key={session.id} 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setSelectedSession(session)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                {getStatusBadge(session)}
                <Badge variant="outline">Listino {session.price_list}</Badge>
              </div>

              <div>
                <h3 className="font-semibold text-lg">{session.customer_name || 'Nome non disponibile'}</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  {session.customer_email && <div>{session.customer_email}</div>}
                  {session.customer_phone && <div>{session.customer_phone}</div>}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Creato: {format(new Date(session.created_at), 'dd/MM/yyyy, HH:mm', { locale: it })}
              </div>

              {session.is_used && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  Link utilizzato
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="font-medium text-sm mb-2">Attività del cliente:</div>
                {getActivitySummary(session)}
              </div>

              {session.feedback_status === 'not_interested' && session.feedback_reason && (
                <div className="pt-2 border-t">
                  <div className="font-medium text-sm mb-1">Motivo non interessato:</div>
                  <div className="text-sm text-muted-foreground">{session.feedback_reason}</div>
                </div>
              )}

              {session.configurator_quotes && (
                <div className="pt-2 border-t">
                  <div className="font-medium text-sm mb-1">Ordine:</div>
                  <div className="text-sm text-muted-foreground">
                    Totale: €{session.configurator_quotes.total_price.toLocaleString()}
                    {session.configurator_quotes.payment_completed && <span className="text-green-600 ml-2">• Pagato</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  sendEmailToCustomer(session);
                }}
                title="Invia email"
              >
                <Mail className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  copyLink(session.token);
                }}
                title="Copia link"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  regenerateLink(session.id);
                }}
                title="Rigenera link"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/configuratore')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna all'Admin
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="w-4 h-4 mr-2" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Kanban
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CRM Link Configuratore</h1>
          <p className="text-muted-foreground">Tracciamento completo delle sessioni e attività dei clienti</p>
        </div>

        {!showNewLinkForm ? (
          <Button onClick={() => setShowNewLinkForm(true)} className="mb-6">
            <Plus className="w-4 h-4 mr-2" />
            Genera Nuovo Link
          </Button>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nuovo Link Configuratore</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Cliente *</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Mario Rossi"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Cliente *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="mario@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefono Cliente *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+39 123 456 7890"
                />
              </div>
              <div>
                <Label htmlFor="priceList">Listino Prezzi</Label>
                <Select value={priceList} onValueChange={setPriceList}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Listino A</SelectItem>
                    <SelectItem value="B">Listino B</SelectItem>
                    <SelectItem value="C">Listino C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={generateNewLink} className="flex-1">
                  Genera Link
                </Button>
                <Button 
                  onClick={() => {
                    setShowNewLinkForm(false);
                    setCustomerName('');
                    setCustomerEmail('');
                    setCustomerPhone('');
                    setPriceList('A');
                  }} 
                  variant="outline"
                >
                  Annulla
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === 'list' ? (
          <div className="grid gap-4">
            {sessions.map(session => renderSessionCard(session))}

            {sessions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Nessuna sessione trovata</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="inline-flex gap-4 min-w-full">
              {/* Colonna Nuovo */}
              <div className="w-[280px] flex-shrink-0 space-y-3">
                <div className="bg-card border-2 rounded-lg p-3 sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <h3 className="font-semibold text-sm">Nuovo</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{kanbanGroups.nuovo.length} link</p>
                </div>
                <div className="space-y-3">
                  {kanbanGroups.nuovo.map(session => renderSessionCard(session, true))}
                  {kanbanGroups.nuovo.length === 0 && (
                    <div className="text-center p-8 text-sm text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                      Nessun link nuovo
                    </div>
                  )}
                </div>
              </div>

              {/* Colonna Aperto */}
              <div className="w-[280px] flex-shrink-0 space-y-3">
                <div className="bg-card border-2 rounded-lg p-3 sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-stone-600"></div>
                    <h3 className="font-semibold text-sm">Aperto</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{kanbanGroups.aperto.length} sessioni</p>
                </div>
                <div className="space-y-3">
                  {kanbanGroups.aperto.map(session => renderSessionCard(session, true))}
                  {kanbanGroups.aperto.length === 0 && (
                    <div className="text-center p-8 text-sm text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                      Nessuna sessione aperta
                    </div>
                  )}
                </div>
              </div>

              {/* Colonna Interessato */}
              <div className="w-[280px] flex-shrink-0 space-y-3">
                <div className="bg-card border-2 rounded-lg p-3 sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                    <h3 className="font-semibold text-sm">Interessato</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{kanbanGroups.interessato.length} clienti</p>
                </div>
                <div className="space-y-3">
                  {kanbanGroups.interessato.map(session => renderSessionCard(session, true))}
                  {kanbanGroups.interessato.length === 0 && (
                    <div className="text-center p-8 text-sm text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                      Nessun cliente interessato
                    </div>
                  )}
                </div>
              </div>

              {/* Colonna Pagamento Avviato */}
              <div className="w-[280px] flex-shrink-0 space-y-3">
                <div className="bg-card border-2 rounded-lg p-3 sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <h3 className="font-semibold text-sm">Pagamento Avviato</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{kanbanGroups.pagamento.length} in corso</p>
                </div>
                <div className="space-y-3">
                  {kanbanGroups.pagamento.map(session => renderSessionCard(session, true))}
                  {kanbanGroups.pagamento.length === 0 && (
                    <div className="text-center p-8 text-sm text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                      Nessun pagamento in corso
                    </div>
                  )}
                </div>
              </div>

              {/* Colonna Pagato */}
              <div className="w-[280px] flex-shrink-0 space-y-3">
                <div className="bg-card border-2 rounded-lg p-3 sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    <h3 className="font-semibold text-sm">Pagato</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{kanbanGroups.pagato.length} ordini</p>
                </div>
                <div className="space-y-3">
                  {kanbanGroups.pagato.map(session => renderSessionCard(session, true))}
                  {kanbanGroups.pagato.length === 0 && (
                    <div className="text-center p-8 text-sm text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                      Nessun ordine pagato
                    </div>
                  )}
                </div>
              </div>

              {/* Colonna Non Interessato */}
              <div className="w-[280px] flex-shrink-0 space-y-3">
                <div className="bg-card border-2 rounded-lg p-3 sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
                    <h3 className="font-semibold text-sm">Non Interessato</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{kanbanGroups.nonInteressato.length} archiviati</p>
                </div>
                <div className="space-y-3">
                  {kanbanGroups.nonInteressato.map(session => renderSessionCard(session, true))}
                  {kanbanGroups.nonInteressato.length === 0 && (
                    <div className="text-center p-8 text-sm text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                      Nessuno non interessato
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Detail Modal */}
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedSession && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <DialogTitle className="text-2xl mb-2">
                        {selectedSession.customer_name || 'Nome non disponibile'}
                      </DialogTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(selectedSession)}
                        <Badge variant="outline">Listino {selectedSession.price_list}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendEmailToCustomer(selectedSession)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Invia Email
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyLink(selectedSession.token)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copia Link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => regenerateLink(selectedSession.id)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Rigenera
                      </Button>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Contact Info */}
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">INFORMAZIONI CONTATTO</h3>
                    <div className="space-y-2">
                      {selectedSession.customer_email && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium w-20">Email:</span>
                          <span className="text-sm">{selectedSession.customer_email}</span>
                        </div>
                      )}
                      {selectedSession.customer_phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium w-20">Telefono:</span>
                          <span className="text-sm">{selectedSession.customer_phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-20">Creato:</span>
                        <span className="text-sm">
                          {format(new Date(selectedSession.created_at), 'dd/MM/yyyy, HH:mm', { locale: it })}
                        </span>
                      </div>
                      {selectedSession.last_opened_at && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium w-20">Ultimo accesso:</span>
                          <span className="text-sm">
                            {format(new Date(selectedSession.last_opened_at), 'dd/MM/yyyy, HH:mm', { locale: it })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Link Status */}
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">STATO LINK</h3>
                    {selectedSession.is_used ? (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Link utilizzato</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Link non ancora aperto</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Activity Timeline */}
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">ATTIVITÀ DEL CLIENTE</h3>
                    {selectedSession.customer_actions && selectedSession.customer_actions.length > 0 ? (
                      <div className="space-y-3">
                        {(selectedSession.customer_actions as any[]).map((action: any, idx: number) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {action.type === 'model_selected' && 'Ha selezionato un modello'}
                                {action.type === 'fuel_selected' && 'Ha scelto l\'alimentazione'}
                                {action.type === 'size_selected' && 'Ha scelto la dimensione'}
                                {action.type === 'coating_selected' && 'Ha scelto il rivestimento'}
                                {action.type === 'color_render_generated' && 'Ha generato un render colore'}
                                {action.type === 'architect_ai_used' && 'Ha usato Architetto AI'}
                                {action.type === 'quote_saved' && 'Ha salvato il preventivo'}
                              </div>
                              {action.data && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {action.data.model_name && `Modello: ${action.data.model_name}`}
                                  {action.data.fuel_type && ` • Alimentazione: ${action.data.fuel_type}`}
                                  {action.data.diameter && ` • Diametro: ${action.data.diameter}cm`}
                                  {action.data.coating && ` • Rivestimento: ${action.data.coating}`}
                                </div>
                              )}
                              {action.timestamp && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(action.timestamp), 'dd/MM/yyyy, HH:mm:ss', { locale: it })}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nessuna attività registrata</p>
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  {selectedSession.feedback_status === 'not_interested' && selectedSession.feedback_reason && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-3">MOTIVO NON INTERESSATO</h3>
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 px-4 py-3 rounded-lg">
                          <p className="text-sm">{selectedSession.feedback_reason}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Order Info */}
                  {selectedSession.configurator_quotes && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-3">DETTAGLI ORDINE</h3>
                        <div className="bg-muted/50 px-4 py-3 rounded-lg space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Totale ordine:</span>
                            <span className="text-lg font-bold">
                              €{selectedSession.configurator_quotes.total_price.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Stato:</span>
                            <Badge variant={selectedSession.configurator_quotes.payment_completed ? 'default' : 'secondary'}>
                              {selectedSession.configurator_quotes.payment_completed ? 'Pagato' : 'In attesa'}
                            </Badge>
                          </div>
                          {selectedSession.configurator_quotes.payment_completed && (
                            <div className="pt-2 border-t">
                              <div className="text-xs text-green-600">
                                ✓ Pagamento completato
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SessionsCRM;
