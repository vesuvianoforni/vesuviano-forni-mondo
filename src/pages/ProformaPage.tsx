import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, FileText, Palette, CreditCard, Check, Truck, Shield, Clock } from 'lucide-react';
import ProformaColorEditor from '@/components/proforma/ProformaColorEditor';

interface ProformaItem {
  id: string;
  item_type: string;
  model_name: string | null;
  custom_name: string | null;
  custom_description: string | null;
  fuel_type: string | null;
  diameter: number | null;
  coating: string | null;
  image_url: string | null;
  ai_render_url: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  specifications: any;
}

interface ProformaData {
  id: string;
  token: string;
  customer_name: string | null;
  company_name: string | null;
  total_price: number;
  deposit_percentage: number;
  deposit_amount: number;
  delivery_days: number | null;
  payment_option: string;
  payment_status: string;
  notes: string | null;
  status: string;
  valid_until: string | null;
  created_at: string;
}

const ProformaPage = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const [proforma, setProforma] = useState<ProformaData | null>(null);
  const [items, setItems] = useState<ProformaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [editingColorItem, setEditingColorItem] = useState<ProformaItem | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (token) {
      // If returning from Stripe, verify payment first
      if (searchParams.get('payment') === 'success') {
        verifyPayment().then(() => loadProforma());
      } else {
        loadProforma();
      }
    }
  }, [token]);

  const verifyPayment = async () => {
    try {
      await supabase.functions.invoke('verify-proforma-payment', {
        body: { token }
      });
    } catch (e) {
      console.error('Verify payment error:', e);
    }
  };

  const loadProforma = async () => {
    setLoading(true);
    const { data: proformaData, error } = await supabase
      .from('proformas')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !proformaData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProforma(proformaData as any);

    const { data: itemsData } = await supabase
      .from('proforma_items')
      .select('*')
      .eq('proforma_id', proformaData.id)
      .order('sort_order');

    if (itemsData) setItems(itemsData as any);
    setLoading(false);
  };

  const handlePayDeposit = async () => {
    if (!proforma) return;
    setPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-proforma-payment', {
        body: {
          proforma_id: proforma.id,
          token: proforma.token,
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No payment URL returned');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Errore nel pagamento. Riprova.');
    } finally {
      setPaying(false);
    }
  };

  const handleColorRenderGenerated = async (itemId: string, imageUrl: string) => {
    await supabase
      .from('proforma_items')
      .update({ ai_render_url: imageUrl })
      .eq('id', itemId);
    
    setItems(items.map(i => i.id === itemId ? { ...i, ai_render_url: imageUrl } : i));
    setEditingColorItem(null);
    toast.success('Render colore salvato!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-white">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-amber-500/50" />
          <h1 className="text-2xl font-bold mb-2">Pro-Forma non trovata</h1>
          <p className="text-gray-400">Il link potrebbe essere scaduto o non valido.</p>
        </div>
      </div>
    );
  }

  if (!proforma) return null;

  const isPaid = proforma.payment_status === 'paid';

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2a1810] to-[#1a1a1a] border-b border-amber-900/30">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <img src="/lovable-uploads/vesuviano-logo-bianco.png" alt="Vesuviano" className="h-10" />
          </div>
          <h1 className="text-3xl font-bold text-amber-100 mt-4">Pro-Forma</h1>
          {proforma.customer_name && (
            <p className="text-lg text-amber-200/80 mt-1">
              {proforma.company_name ? `${proforma.company_name} — ` : ''}{proforma.customer_name}
            </p>
          )}
          {isPaid && (
            <Badge className="mt-3 bg-green-600 text-white text-sm px-3 py-1">
              <Check className="w-4 h-4 mr-1" /> Deposito Pagato
            </Badge>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {items.map((item) => (
          <Card key={item.id} className="bg-[#222] border-amber-900/20 text-white overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {(item.ai_render_url || item.image_url) && (
                <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                  <img
                    src={item.ai_render_url || item.image_url || ''}
                    alt={item.model_name || item.custom_name || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-amber-100">
                      {item.model_name || item.custom_name}
                    </h3>
                    {item.custom_description && (
                      <p className="text-gray-400 text-sm mt-1">{item.custom_description}</p>
                    )}
                  </div>
                  <span className="text-xl font-bold text-amber-400">
                    €{item.line_total.toLocaleString('it-IT')}
                  </span>
                </div>

                {/* Specs */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {item.fuel_type && (
                    <span className="text-sm bg-amber-900/30 text-amber-200 px-3 py-1 rounded-full">
                      🔥 {item.fuel_type}
                    </span>
                  )}
                  {item.diameter && (
                    <span className="text-sm bg-amber-900/30 text-amber-200 px-3 py-1 rounded-full">
                      Ø {item.diameter}cm
                    </span>
                  )}
                  {item.coating && (
                    <span className="text-sm bg-amber-900/30 text-amber-200 px-3 py-1 rounded-full">
                      🎨 {item.coating}
                    </span>
                  )}
                  {item.quantity > 1 && (
                    <span className="text-sm bg-amber-900/30 text-amber-200 px-3 py-1 rounded-full">
                      x{item.quantity}
                    </span>
                  )}
                </div>

                {/* Color Edit Button */}
                {item.item_type === 'oven' && item.image_url && !isPaid && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border-amber-700 text-amber-300 hover:bg-amber-900/30"
                    onClick={() => setEditingColorItem(item)}
                  >
                    <Palette className="w-4 h-4 mr-2" /> Personalizza Colore
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Summary & Payment */}
        <Card className="bg-[#222] border-amber-900/20 text-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between text-lg">
              <span className="text-gray-300">Totale</span>
              <span className="font-bold text-2xl text-amber-100">€{proforma.total_price.toLocaleString('it-IT')}</span>
            </div>

            <Separator className="bg-amber-900/30" />

            <div className="space-y-3">
              {proforma.payment_option === 'deposit_5' ? (
                <div className="bg-amber-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-200 flex items-center gap-2">
                    <Shield className="w-5 h-5" /> Blocca l'offerta con il 5%
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">
                    Paga <span className="text-amber-300 font-bold">€{proforma.deposit_amount.toLocaleString('it-IT')}</span> per 
                    bloccare questa offerta. Il saldo verrà pagato alla consegna del forno.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-200 flex items-center gap-2">
                    <Truck className="w-5 h-5" /> Acconto 50% — Spedizione Rapida
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">
                    Paga <span className="text-amber-300 font-bold">€{proforma.deposit_amount.toLocaleString('it-IT')}</span> come acconto.
                    {proforma.delivery_days && (
                      <> Il forno verrà spedito in <span className="text-amber-300 font-bold">{proforma.delivery_days} giorni</span>.</>
                    )}
                    {' '}Il saldo di €{(proforma.total_price - proforma.deposit_amount).toLocaleString('it-IT')} alla consegna.
                  </p>
                </div>
              )}
            </div>

            {proforma.notes && (
              <div className="bg-[#1a1a1a] rounded-lg p-4">
                <p className="text-sm text-gray-400">{proforma.notes}</p>
              </div>
            )}

            {!isPaid && (
              <Button
                onClick={handlePayDeposit}
                disabled={paying}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-lg py-6"
              >
                {paying ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                Paga Deposito — €{proforma.deposit_amount.toLocaleString('it-IT')}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-8">
          <p>Vesuviano Forni — Forni Artigianali dal Vesuvio al Mondo</p>
          <p className="mt-1">info@vesuvianoforni.com | +39 081 529 8484</p>
        </div>
      </div>

      {/* Color Editor Modal */}
      {editingColorItem && (
        <ProformaColorEditor
          item={editingColorItem}
          onClose={() => setEditingColorItem(null)}
          onRenderGenerated={(imageUrl) => handleColorRenderGenerated(editingColorItem.id, imageUrl)}
        />
      )}
    </div>
  );
};

export default ProformaPage;
