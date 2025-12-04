import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, RefreshCw, ArrowLeft, Check, X, Clock, Package, Plus, LayoutList, LayoutGrid, Mail, Trash2, Search, Send, Sparkles, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { SendLinkEmailModal } from '@/components/admin/SendLinkEmailModal';
import { AIConversionMessageModal } from '@/components/admin/AIConversionMessageModal';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailHistoryItem {
  id: string;
  sent_at: string;
  email_type: string;
  subject: string;
  body: string;
  sent_to: string;
}

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
  customer_info: any;
  link_sent: boolean;
  sent_via_email: boolean;
  sent_via_whatsapp: boolean;
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
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [priceList, setPriceList] = useState('A');
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailModalSession, setEmailModalSession] = useState<SessionData | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
  const [loadingEmailHistory, setLoadingEmailHistory] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  // Real-time subscription for session updates
  useEffect(() => {
    console.log('Setting up real-time subscription...');
    
    const channel = supabase
      .channel('configurator-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'configurator_sessions'
        },
        async (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch the new session with related data
            const { data: newSession, error } = await supabase
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
              .eq('id', payload.new.id)
              .single();

            if (!error && newSession) {
              setSessions(prev => [newSession as SessionData, ...prev]);
              toast.success('Nuova sessione creata!');
            }
          } else if (payload.eventType === 'UPDATE') {
            // Fetch the updated session with related data
            const { data: updatedSession, error } = await supabase
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
              .eq('id', payload.new.id)
              .single();

            if (!error && updatedSession) {
              setSessions(prev => 
                prev.map(session => 
                  session.id === updatedSession.id ? updatedSession as SessionData : session
                )
              );
              
              // Update selected session if it's the one being viewed
              if (selectedSession?.id === updatedSession.id) {
                setSelectedSession(updatedSession as SessionData);
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setSessions(prev => prev.filter(session => session.id !== payload.old.id));
            
            // Close detail modal if the deleted session was being viewed
            if (selectedSession?.id === payload.old.id) {
              setSelectedSession(null);
            }
            
            toast.info('Sessione eliminata');
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription...');
      supabase.removeChannel(channel);
    };
  }, [selectedSession]);

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
    const link = `https://www.vesuvianoforni.com/configuratore/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiato!');
  };

  // Load email history when a session is selected
  useEffect(() => {
    const loadEmailHistory = async () => {
      if (!selectedSession) {
        setEmailHistory([]);
        return;
      }
      
      setLoadingEmailHistory(true);
      try {
        const { data, error } = await supabase
          .from('email_history')
          .select('id, sent_at, email_type, subject, body, sent_to')
          .eq('session_id', selectedSession.id)
          .order('sent_at', { ascending: false });
        
        if (error) throw error;
        setEmailHistory(data || []);
      } catch (error) {
        console.error('Error loading email history:', error);
      } finally {
        setLoadingEmailHistory(false);
      }
    };

    loadEmailHistory();
  }, [selectedSession?.id]);

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

  const processRenewalRequest = async (session: SessionData) => {
    if (!confirm(`Processare il rinnovo per ${session.customer_name}? Il link verrà rigenerato.`)) return;

    try {
      const newToken = generateToken();
      
      // Add renewal action to existing customer_actions
      const existingActions = session.customer_actions || [];
      const renewalAction = {
        type: 'link_renewed',
        timestamp: new Date().toISOString(),
        oldToken: session.token,
        newToken: newToken,
        renewedBy: 'admin'
      };
      const updatedActions = [...existingActions, renewalAction];
      
      // Update session: move to "aperto" state with new token and track renewal
      const { error: updateError } = await supabase
        .from('configurator_sessions')
        .update({ 
          token: newToken,
          status: 'draft',
          is_used: true,
          feedback_status: null,  // Clear feedback to ensure it goes to "Aperto"
          customer_actions: updatedActions
        })
        .eq('id', session.id);

      if (updateError) throw updateError;

      // Track the renewal in email_history
      const { error: historyError } = await supabase
        .from('email_history')
        .insert({
          session_id: session.id,
          email_type: 'renewal_processed',
          subject: 'Rinnovo Link Configuratore',
          body: `Link rinnovato per ${session.customer_name}. Nuovo token generato.`,
          sent_to: session.customer_email || 'N/A',
          sent_from: 'info@vesuvianoforni.com'
        });

      if (historyError) {
        console.error('Error tracking renewal in history:', historyError);
      }

      // Copy new link to clipboard
      const link = `https://www.vesuvianoforni.com/configuratore/${newToken}`;
      await navigator.clipboard.writeText(link);

      toast.success('Rinnovo processato! Link copiato negli appunti. La sessione è tornata in "Aperto".');
      loadSessions();
    } catch (error) {
      console.error('Error processing renewal:', error);
      toast.error('Errore nel processare il rinnovo');
    }
  };

  const sendEmailToCustomer = (session: SessionData) => {
    setEmailModalSession(session);
  };

  const toggleSentViaEmail = async (sessionId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('configurator_sessions')
        .update({ sent_via_email: !currentValue })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success(currentValue ? 'Rimosso invio email' : 'Marcato come inviato via email');
      loadSessions();
    } catch (error) {
      console.error('Error updating sent_via_email:', error);
      toast.error('Errore nell\'aggiornamento dello stato');
    }
  };

  const toggleSentViaWhatsApp = async (sessionId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('configurator_sessions')
        .update({ sent_via_whatsapp: !currentValue })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success(currentValue ? 'Rimosso invio WhatsApp' : 'Marcato come inviato via WhatsApp');
      loadSessions();
    } catch (error) {
      console.error('Error updating sent_via_whatsapp:', error);
      toast.error('Errore nell\'aggiornamento dello stato');
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

      const link = `https://www.vesuvianoforni.com/configuratore/${token}`;
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

  const deleteSession = async (sessionId: string, customerName: string) => {
    if (!confirm(`Sei sicuro di voler eliminare la sessione di ${customerName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('configurator_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Sessione eliminata con successo');
      loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Errore nell\'eliminazione della sessione');
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
    if (session.status === 'link_renewal_requested') {
      return (
        <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
          <RefreshCw className="w-3 h-3 mr-1" />
          Rinnovo Richiesto
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
    
    // Show ERP origin if applicable
    if (session.customer_info?.imported_from === 'erp') {
      const pipelineInfo = session.customer_info.pipeline_id 
        ? ` (Pipeline: ${session.customer_info.pipeline_id})`
        : '';
      summary.push(`📊 Importato da ERP${pipelineInfo}`);
    }
    
    if (session.is_used) {
      summary.push(`Aperto ${session.last_opened_at ? format(new Date(session.last_opened_at), 'dd/MM/yy HH:mm', { locale: it }) : ''}`);
    }
    
    // Extract details from actions
    const modelAction = actions.find((a: any) => a.type === 'model_selected');
    const fuelAction = actions.find((a: any) => a.type === 'fuel_selected');
    const sizeAction = actions.find((a: any) => a.type === 'size_selected');
    const coatingAction = actions.find((a: any) => a.type === 'coating_selected');
    const quoteAction = actions.find((a: any) => a.type === 'quote_saved');
    const contactAction = actions.find((a: any) => a.type === 'contact_requested');
    const paymentAction = actions.find((a: any) => a.type === 'payment_initiated');
    
    const actionTypes = new Set(actions.map((a: any) => a.type));
    
    if (modelAction) summary.push(`Modello: ${modelAction.model || 'N/A'}`);
    if (fuelAction) summary.push(`Alimentazione: ${fuelAction.fuelType || 'N/A'}`);
    if (sizeAction) summary.push(`Diametro: ${sizeAction.diameter || 'N/A'} cm`);
    if (coatingAction) summary.push(`Rivestimento: ${coatingAction.coating || 'N/A'}`);
    if (actionTypes.has('color_render_generated')) summary.push('✓ Ha generato render colore');
    if (actionTypes.has('architect_ai_used')) summary.push('✓ Ha usato Architetto AI');
    
    // Show link renewals
    const renewalActions = actions.filter((a: any) => a.type === 'link_renewed');
    if (renewalActions.length > 0) {
      const lastRenewal = renewalActions[renewalActions.length - 1];
      const renewalDate = lastRenewal.timestamp ? format(new Date(lastRenewal.timestamp), 'dd/MM/yy HH:mm', { locale: it }) : '';
      summary.push(`🔄 Link rinnovato ${renewalActions.length > 1 ? `(${renewalActions.length}x)` : ''} ${renewalDate}`);
    }
    
    // Show price if available - try multiple sources, now including coating_selected
    let priceFound = false;
    
    // Try from coating action first (most recent configuration price)
    if (coatingAction?.totalPrice) {
      summary.push(`💰 Prezzo: €${Number(coatingAction.totalPrice).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      priceFound = true;
    } else if (coatingAction?.total_price) {
      summary.push(`💰 Prezzo: €${Number(coatingAction.total_price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      priceFound = true;
    }
    
    // Try from quote action
    if (!priceFound && quoteAction?.totalPrice) {
      summary.push(`💰 Prezzo: €${Number(quoteAction.totalPrice).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      priceFound = true;
    } else if (!priceFound && quoteAction?.total_price) {
      summary.push(`💰 Prezzo: €${Number(quoteAction.total_price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      priceFound = true;
    }
    
    // Try from contact action
    if (!priceFound && contactAction?.totalPrice) {
      summary.push(`💰 Prezzo: €${Number(contactAction.totalPrice).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      priceFound = true;
    } else if (!priceFound && contactAction?.total_price) {
      summary.push(`💰 Prezzo: €${Number(contactAction.total_price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      priceFound = true;
    }
    
    // Try from payment action
    if (!priceFound && paymentAction?.totalPrice) {
      summary.push(`💰 Prezzo: €${Number(paymentAction.totalPrice).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      priceFound = true;
    } else if (!priceFound && paymentAction?.total_price) {
      summary.push(`💰 Prezzo: €${Number(paymentAction.total_price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      priceFound = true;
    }
    
    // Finally try from configurator_quotes table
    if (!priceFound && session.configurator_quotes?.total_price) {
      summary.push(`💰 Prezzo: €${Number(session.configurator_quotes.total_price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      priceFound = true;
    }

    return (
      <div className="text-sm text-muted-foreground space-y-1">
        {summary.map((item, idx) => (
          <div key={idx}>• {item}</div>
        ))}
      </div>
    );
  };

  const filterSessions = (sessionList: SessionData[]) => {
    if (!searchQuery.trim()) return sessionList;
    
    const query = searchQuery.toLowerCase();
    return sessionList.filter(s => 
      s.customer_name?.toLowerCase().includes(query) ||
      s.customer_email?.toLowerCase().includes(query) ||
      s.customer_phone?.toLowerCase().includes(query)
    );
  };

  const groupSessionsByStatus = () => {
    const filteredSessions = filterSessions(sessions);
    const groups = {
      nuovo: filteredSessions.filter(s => !s.is_used && s.status !== 'link_renewal_requested'),
      aperto: filteredSessions.filter(s => s.is_used && !s.feedback_status && s.status !== 'payment_initiated' && s.status !== 'link_renewal_requested' && !s.configurator_quotes?.payment_completed),
      rinnovoRichiesto: filteredSessions.filter(s => s.status === 'link_renewal_requested'),
      interessato: filteredSessions.filter(s => (s.status === 'interested' || s.feedback_status === 'interested') && !s.configurator_quotes?.payment_completed),
      pagamento: filteredSessions.filter(s => s.status === 'payment_initiated' && !s.configurator_quotes?.payment_completed),
      pagato: filteredSessions.filter(s => s.configurator_quotes?.payment_completed),
      nonInteressato: filteredSessions.filter(s => s.feedback_status === 'not_interested')
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
          className="hover:shadow-lg transition-all border-l-4 cursor-pointer mb-4" 
          onClick={() => setSelectedSession(session)}
          style={{
          borderLeftColor: session.configurator_quotes?.payment_completed ? '#16a34a' : 
                           session.status === 'payment_initiated' ? '#2563eb' :
                           session.status === 'link_renewal_requested' ? '#d97706' :
                           session.status === 'interested' || session.feedback_status === 'interested' ? '#ea580c' :
                           session.feedback_status === 'not_interested' ? '#dc2626' :
                           session.is_used ? '#57534e' : '#e5e7eb'
        }}>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header with status badge and price list */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b">
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  {getStatusBadge(session, true)}
                  <Badge variant="outline" className="w-fit text-xs">
                    Listino {session.price_list}
                  </Badge>
                </div>
              </div>

              {/* Action buttons row */}
              <div className="flex gap-1.5 justify-end border-b pb-3">
                {session.customer_email && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSessionId(session.id);
                      setAiModalOpen(true);
                    }}
                    title="Genera messaggio AI"
                    className="h-8 w-8 p-0"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                )}
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
                  <Mail className="w-4 h-4" />
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
                  <Copy className="w-4 h-4" />
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
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id, session.customer_name || 'Cliente');
                  }}
                  title="Elimina sessione"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Process renewal button for renewal requested sessions */}
              {session.status === 'link_renewal_requested' && (
                <div className="pb-3 border-b" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => processRenewalRequest(session)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Processa Rinnovo
                  </Button>
                </div>
              )}

              {/* Customer info */}
              <div className="min-w-0 space-y-2">
                <h4 className="font-semibold text-base leading-tight">{session.customer_name || 'Nome non disponibile'}</h4>
                <div className="text-xs text-muted-foreground space-y-1.5">
                  {session.customer_email && (
                    <div className="truncate" title={session.customer_email}>{session.customer_email}</div>
                  )}
                  {session.customer_phone && <div>{session.customer_phone}</div>}
                </div>
              </div>

              {/* Date info */}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <div>Creato: {format(new Date(session.created_at), 'dd/MM/yy HH:mm', { locale: it })}</div>
              </div>

              {/* Link status indicator */}
              {session.is_used && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950 px-2.5 py-1.5 rounded">
                  <Check className="w-3.5 h-3.5" />
                  Link utilizzato
                </div>
              )}

              {/* Delivery method checkboxes */}
              <div 
                className="space-y-2.5 pt-3 border-t"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <Checkbox
                    id={`sent-email-${session.id}`}
                    checked={session.sent_via_email}
                    onCheckedChange={() => toggleSentViaEmail(session.id, session.sent_via_email)}
                  />
                  <label
                    htmlFor={`sent-email-${session.id}`}
                    className="cursor-pointer select-none leading-none"
                  >
                    Inviato via Email
                  </label>
                </div>
                <div className="flex items-center gap-2.5 text-xs">
                  <Checkbox
                    id={`sent-whatsapp-${session.id}`}
                    checked={session.sent_via_whatsapp}
                    onCheckedChange={() => toggleSentViaWhatsApp(session.id, session.sent_via_whatsapp)}
                  />
                  <label
                    htmlFor={`sent-whatsapp-${session.id}`}
                    className="cursor-pointer select-none leading-none"
                  >
                    Inviato via WhatsApp
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Full detailed card for list view
    return (
      <Card key={session.id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {getStatusBadge(session)}
                <Badge variant="secondary">Listino {session.price_list}</Badge>
              </div>
              <h3 className="text-lg font-semibold">{session.customer_name || 'Nome non disponibile'}</h3>
              <div className="text-sm text-muted-foreground space-y-1 mt-1">
                {session.customer_email && <div>📧 {session.customer_email}</div>}
                {session.customer_phone && <div>📱 {session.customer_phone}</div>}
              </div>
            </div>
            <div className="flex gap-2">
              {session.customer_email && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedSessionId(session.id);
                    setAiModalOpen(true);
                  }}
                  title="Genera messaggio AI"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => sendEmailToCustomer(session)}
                title="Invia email"
              >
                <Mail className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyLink(session.token)}
                title="Copia link"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => regenerateLink(session.id)}
                title="Rigenera link"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteSession(session.id, session.customer_name || 'Cliente')}
                className="text-destructive hover:text-destructive"
                title="Elimina sessione"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium">Creato:</span>
              <span className="text-sm text-muted-foreground ml-2">
                {format(new Date(session.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
              </span>
            </div>
            {session.last_opened_at && (
              <div>
                <span className="text-sm font-medium">Ultimo accesso:</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {format(new Date(session.last_opened_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                </span>
              </div>
            )}
            <div>
              <span className="text-sm font-medium">Attività:</span>
              <div className="mt-2">
                {getActivitySummary(session)}
              </div>
            </div>
            {session.feedback_reason && (
              <div>
                <span className="text-sm font-medium">Motivo feedback:</span>
                <div className="text-sm text-muted-foreground mt-1">{session.feedback_reason}</div>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`sent-email-list-${session.id}`}
                checked={session.sent_via_email}
                onCheckedChange={() => toggleSentViaEmail(session.id, session.sent_via_email)}
              />
              <label
                htmlFor={`sent-email-list-${session.id}`}
                className="text-sm cursor-pointer select-none"
              >
                Inviato via Email
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`sent-whatsapp-list-${session.id}`}
                checked={session.sent_via_whatsapp}
                onCheckedChange={() => toggleSentViaWhatsApp(session.id, session.sent_via_whatsapp)}
              />
              <label
                htmlFor={`sent-whatsapp-list-${session.id}`}
                className="text-sm cursor-pointer select-none"
              >
                Inviato via WhatsApp
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/configurator')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna al Dashboard
            </Button>
            <h1 className="text-2xl font-bold">CRM Configuratore</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cerca cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="w-4 h-4 mr-2" />
              Lista
            </Button>
            <Button onClick={() => setShowNewLinkForm(!showNewLinkForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Link
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {showNewLinkForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Genera Nuovo Link Configuratore</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
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
                    <SelectTrigger id="priceList">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Listino A</SelectItem>
                      <SelectItem value="B">Listino B</SelectItem>
                      <SelectItem value="C">Listino C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={generateNewLink}>
                  Genera Link
                </Button>
                <Button variant="outline" onClick={() => setShowNewLinkForm(false)}>
                  Annulla
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {/* Nuovo */}
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-lg p-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  Nuovo
                  <Badge variant="outline">{kanbanGroups.nuovo.length}</Badge>
                </h3>
              </div>
              <div className="space-y-3">
                {kanbanGroups.nuovo.map(session => renderSessionCard(session, true))}
              </div>
            </div>

            {/* Aperto */}
            <div className="space-y-3">
              <div className="bg-stone-100 dark:bg-stone-900 rounded-lg p-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  Aperto
                  <Badge variant="outline">{kanbanGroups.aperto.length}</Badge>
                </h3>
              </div>
              <div className="space-y-3">
                {kanbanGroups.aperto.map(session => renderSessionCard(session, true))}
              </div>
            </div>

            {/* Rinnovo Richiesto */}
            <div className="space-y-3">
              <div className="bg-amber-100 dark:bg-amber-950 rounded-lg p-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  Rinnovo Richiesto
                  <Badge variant="outline">{kanbanGroups.rinnovoRichiesto.length}</Badge>
                </h3>
              </div>
              <div className="space-y-3">
                {kanbanGroups.rinnovoRichiesto.map(session => renderSessionCard(session, true))}
              </div>
            </div>

            {/* Interessato */}
            <div className="space-y-3">
              <div className="bg-orange-100 dark:bg-orange-950 rounded-lg p-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  Interessato
                  <Badge variant="outline">{kanbanGroups.interessato.length}</Badge>
                </h3>
              </div>
              <div className="space-y-3">
                {kanbanGroups.interessato.map(session => renderSessionCard(session, true))}
              </div>
            </div>

            {/* Pagamento Avviato */}
            <div className="space-y-3">
              <div className="bg-blue-100 dark:bg-blue-950 rounded-lg p-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  Pagamento Avviato
                  <Badge variant="outline">{kanbanGroups.pagamento.length}</Badge>
                </h3>
              </div>
              <div className="space-y-3">
                {kanbanGroups.pagamento.map(session => renderSessionCard(session, true))}
              </div>
            </div>

            {/* Pagato */}
            <div className="space-y-3">
              <div className="bg-green-100 dark:bg-green-950 rounded-lg p-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  Pagato
                  <Badge variant="outline">{kanbanGroups.pagato.length}</Badge>
                </h3>
              </div>
              <div className="space-y-3">
                {kanbanGroups.pagato.map(session => renderSessionCard(session, true))}
              </div>
            </div>

            {/* Non Interessato */}
            <div className="space-y-3">
              <div className="bg-red-100 dark:bg-red-950 rounded-lg p-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  Non Interessato
                  <Badge variant="outline">{kanbanGroups.nonInteressato.length}</Badge>
                </h3>
              </div>
              <div className="space-y-3">
                {kanbanGroups.nonInteressato.map(session => renderSessionCard(session, true))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filterSessions(sessions).map(session => renderSessionCard(session, false))}
          </div>
        )}

        {filterSessions(sessions).length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nessuna sessione trovata</p>
          </div>
        )}
      </div>

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dettagli Sessione</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedSession)}
                <Badge variant="secondary">Listino {selectedSession.price_list}</Badge>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedSession.customer_name || 'Nome non disponibile'}</h3>
                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                  {selectedSession.customer_email && <div>📧 {selectedSession.customer_email}</div>}
                  {selectedSession.customer_phone && <div>📱 {selectedSession.customer_phone}</div>}
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Link configuratore:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                      https://www.vesuvianoforni.com/configuratore/{selectedSession.token}
                    </code>
                    <Button size="sm" variant="outline" onClick={() => copyLink(selectedSession.token)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Creato:</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {format(new Date(selectedSession.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                  </span>
                </div>
                {selectedSession.last_opened_at && (
                  <div>
                    <span className="text-sm font-medium">Ultimo accesso:</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {format(new Date(selectedSession.last_opened_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium">Attività:</span>
                  <div className="mt-2">
                    {getActivitySummary(selectedSession)}
                  </div>
                </div>
                {selectedSession.feedback_reason && (
                  <div>
                    <span className="text-sm font-medium">Motivo feedback:</span>
                    <div className="text-sm text-muted-foreground mt-1">{selectedSession.feedback_reason}</div>
                  </div>
                )}

                {/* Email History Section */}
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">Cronologia Email Follow-up</span>
                    <Badge variant="outline" className="ml-auto">{emailHistory.length}</Badge>
                  </div>
                  
                  {loadingEmailHistory ? (
                    <p className="text-sm text-muted-foreground">Caricamento...</p>
                  ) : emailHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nessuna email inviata</p>
                  ) : (
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-3">
                        {emailHistory.map((email) => (
                          <div key={email.id} className="bg-muted/30 rounded-lg p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {email.email_type === 'ai_sales' ? 'AI Sales' : 
                                 email.email_type === 'link' ? 'Invio Link' : email.email_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(email.sent_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{email.subject}</p>
                            <p className="text-xs text-muted-foreground">A: {email.sent_to}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Modal */}
      {emailModalSession && (
        <SendLinkEmailModal
          session={emailModalSession}
          isOpen={!!emailModalSession}
          onClose={() => setEmailModalSession(null)}
        />
      )}

      {/* AI Conversion Message Modal */}
      <AIConversionMessageModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        sessionId={selectedSessionId}
        language="it"
        onEmailSent={async () => {
          // Reload email history for the current session
          if (selectedSession) {
            const { data } = await supabase
              .from('email_history')
              .select('id, sent_at, email_type, subject, body, sent_to')
              .eq('session_id', selectedSession.id)
              .order('sent_at', { ascending: false });
            setEmailHistory(data || []);
          }
        }}
      />
    </div>
  );
};

export default SessionsCRM;