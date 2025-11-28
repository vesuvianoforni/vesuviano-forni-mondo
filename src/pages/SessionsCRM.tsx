import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, RefreshCw, ArrowLeft, Check, X, Clock, Package, Plus, LayoutList, LayoutGrid } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const getStatusBadge = (session: SessionData) => {
    if (session.configurator_quotes?.payment_completed) {
      return <Badge className="bg-green-600 hover:bg-green-700"><Package className="w-3 h-3 mr-1" />Pagato</Badge>;
    }
    if (session.status === 'payment_initiated') {
      return <Badge className="bg-blue-600 hover:bg-blue-700"><Clock className="w-3 h-3 mr-1" />Pagamento Avviato</Badge>;
    }
    if (session.status === 'interested' || session.feedback_status === 'interested') {
      return <Badge className="bg-amber-600 hover:bg-amber-700"><Check className="w-3 h-3 mr-1" />Interessato</Badge>;
    }
    if (session.feedback_status === 'not_interested') {
      return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Non Interessato</Badge>;
    }
    if (session.is_used) {
      return <Badge variant="secondary"><Check className="w-3 h-3 mr-1" />Aperto</Badge>;
    }
    return <Badge variant="outline">Nuovo</Badge>;
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

  const renderSessionCard = (session: SessionData, compact = false) => (
    <Card key={session.id} className={compact ? '' : 'hover:shadow-md transition-shadow'}>
      <CardContent className={compact ? 'p-4' : 'p-6'}>
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

            {!compact && (
              <>
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
              </>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyLink(session.token)}
              title="Copia link"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => regenerateLink(session.id)}
              title="Rigenera link"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Colonna Nuovo */}
            <div className="space-y-3">
              <div className="bg-card border rounded-lg p-3">
                <h3 className="font-semibold text-sm mb-1">Nuovo</h3>
                <p className="text-xs text-muted-foreground">{kanbanGroups.nuovo.length} link</p>
              </div>
              <div className="space-y-3">
                {kanbanGroups.nuovo.map(session => renderSessionCard(session, true))}
              </div>
            </div>

            {/* Colonna Aperto */}
            <div className="space-y-3">
              <div className="bg-card border rounded-lg p-3">
                <h3 className="font-semibold text-sm mb-1">Aperto</h3>
                <p className="text-xs text-muted-foreground">{kanbanGroups.aperto.length} sessioni</p>
              </div>
              <div className="space-y-3">
                {kanbanGroups.aperto.map(session => renderSessionCard(session, true))}
              </div>
            </div>

            {/* Colonna Interessato */}
            <div className="space-y-3">
              <div className="bg-card border rounded-lg p-3">
                <h3 className="font-semibold text-sm mb-1">Interessato</h3>
                <p className="text-xs text-muted-foreground">{kanbanGroups.interessato.length} clienti</p>
              </div>
              <div className="space-y-3">
                {kanbanGroups.interessato.map(session => renderSessionCard(session, true))}
              </div>
            </div>

            {/* Colonna Pagamento Avviato */}
            <div className="space-y-3">
              <div className="bg-card border rounded-lg p-3">
                <h3 className="font-semibold text-sm mb-1">Pagamento Avviato</h3>
                <p className="text-xs text-muted-foreground">{kanbanGroups.pagamento.length} in corso</p>
              </div>
              <div className="space-y-3">
                {kanbanGroups.pagamento.map(session => renderSessionCard(session, true))}
              </div>
            </div>

            {/* Colonna Pagato */}
            <div className="space-y-3">
              <div className="bg-card border rounded-lg p-3">
                <h3 className="font-semibold text-sm mb-1">Pagato</h3>
                <p className="text-xs text-muted-foreground">{kanbanGroups.pagato.length} ordini</p>
              </div>
              <div className="space-y-3">
                {kanbanGroups.pagato.map(session => renderSessionCard(session, true))}
              </div>
            </div>

            {/* Colonna Non Interessato */}
            <div className="space-y-3">
              <div className="bg-card border rounded-lg p-3">
                <h3 className="font-semibold text-sm mb-1">Non Interessato</h3>
                <p className="text-xs text-muted-foreground">{kanbanGroups.nonInteressato.length} archiviati</p>
              </div>
              <div className="space-y-3">
                {kanbanGroups.nonInteressato.map(session => renderSessionCard(session, true))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsCRM;
