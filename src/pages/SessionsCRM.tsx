import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, RefreshCw, ArrowLeft, Check, X, Clock, Package } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

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

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin/configuratore')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna all'Admin
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CRM Link Configuratore</h1>
          <p className="text-muted-foreground">Tracciamento completo delle sessioni e attività dei clienti</p>
        </div>

        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
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
          ))}

          {sessions.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Nessuna sessione trovata</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionsCRM;
