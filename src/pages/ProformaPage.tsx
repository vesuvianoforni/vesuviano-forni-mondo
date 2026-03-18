import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, FileText, Palette, CreditCard, Check, Truck, Shield } from 'lucide-react';
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
  proforma_number: string | null;
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
  language: string;
  currency: string;
  valid_until: string | null;
  created_at: string;
}

const TRANSLATIONS: Record<string, Record<string, string>> = {
  it: {
    proforma: 'Pro-Forma',
    depositPaid: 'Deposito Pagato',
    notFound: 'Pro-Forma non trovata',
    notFoundDesc: 'Il link potrebbe essere scaduto o non valido.',
    total: 'Totale',
    lockOffer: "Blocca l'offerta con il",
    lockOfferDesc: 'per bloccare questa offerta. Il saldo verrà pagato alla consegna del forno.',
    deposit50: 'Acconto 50% — Spedizione Rapida',
    deposit50Desc: 'come acconto.',
    shippedIn: 'Il forno verrà spedito in',
    days: 'giorni',
    balanceAt: 'Il saldo di',
    atDelivery: 'alla consegna.',
    payDeposit: 'Paga Deposito',
    customizeColor: 'Personalizza Colore',
    pay: 'Paga',
    tagline: 'Forni Artigianali dal Vesuvio al Mondo',
  },
  en: {
    proforma: 'Pro-Forma Invoice',
    depositPaid: 'Deposit Paid',
    notFound: 'Pro-Forma not found',
    notFoundDesc: 'The link may have expired or is invalid.',
    total: 'Total',
    lockOffer: 'Lock the offer with',
    lockOfferDesc: 'to lock this offer. The balance will be paid upon delivery.',
    deposit50: '50% Deposit — Fast Shipping',
    deposit50Desc: 'as deposit.',
    shippedIn: 'The oven will be shipped in',
    days: 'days',
    balanceAt: 'Balance of',
    atDelivery: 'upon delivery.',
    payDeposit: 'Pay Deposit',
    customizeColor: 'Customize Color',
    pay: 'Pay',
    tagline: 'Artisan Ovens from Vesuvius to the World',
  },
  fr: {
    proforma: 'Facture Pro-Forma',
    depositPaid: 'Acompte Payé',
    notFound: 'Pro-Forma introuvable',
    notFoundDesc: 'Le lien a peut-être expiré ou est invalide.',
    total: 'Total',
    lockOffer: "Bloquez l'offre avec",
    lockOfferDesc: "pour bloquer cette offre. Le solde sera payé à la livraison.",
    deposit50: 'Acompte 50% — Livraison Rapide',
    deposit50Desc: "en acompte.",
    shippedIn: 'Le four sera expédié en',
    days: 'jours',
    balanceAt: 'Solde de',
    atDelivery: 'à la livraison.',
    payDeposit: "Payer l'Acompte",
    customizeColor: 'Personnaliser la Couleur',
    pay: 'Payer',
    tagline: 'Fours Artisanaux du Vésuve au Monde',
  },
  de: {
    proforma: 'Pro-Forma Rechnung',
    depositPaid: 'Anzahlung Bezahlt',
    notFound: 'Pro-Forma nicht gefunden',
    notFoundDesc: 'Der Link ist möglicherweise abgelaufen oder ungültig.',
    total: 'Gesamt',
    lockOffer: 'Sichern Sie das Angebot mit',
    lockOfferDesc: 'um dieses Angebot zu sichern. Der Restbetrag wird bei Lieferung bezahlt.',
    deposit50: '50% Anzahlung — Schneller Versand',
    deposit50Desc: 'als Anzahlung.',
    shippedIn: 'Der Ofen wird versendet in',
    days: 'Tagen',
    balanceAt: 'Restbetrag von',
    atDelivery: 'bei Lieferung.',
    payDeposit: 'Anzahlung Bezahlen',
    customizeColor: 'Farbe Anpassen',
    pay: 'Bezahlen',
    tagline: 'Handwerkliche Öfen vom Vesuv in die Welt',
  },
  es: {
    proforma: 'Factura Pro-Forma',
    depositPaid: 'Depósito Pagado',
    notFound: 'Pro-Forma no encontrada',
    notFoundDesc: 'El enlace puede haber expirado o no es válido.',
    total: 'Total',
    lockOffer: 'Bloquea la oferta con el',
    lockOfferDesc: 'para bloquear esta oferta. El saldo se pagará en la entrega.',
    deposit50: 'Anticipo 50% — Envío Rápido',
    deposit50Desc: 'como anticipo.',
    shippedIn: 'El horno se enviará en',
    days: 'días',
    balanceAt: 'Saldo de',
    atDelivery: 'en la entrega.',
    payDeposit: 'Pagar Depósito',
    customizeColor: 'Personalizar Color',
    pay: 'Pagar',
    tagline: 'Hornos Artesanales del Vesubio al Mundo',
  },
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ',
};

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
      if (searchParams.get('payment') === 'success') {
        verifyPayment().then(() => loadProforma());
      } else {
        loadProforma();
      }
    }
  }, [token]);

  const verifyPayment = async () => {
    try {
      await supabase.functions.invoke('verify-proforma-payment', { body: { token } });
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
        body: { proforma_id: proforma.id, token: proforma.token },
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

  const lang = proforma?.language || 'it';
  const t = TRANSLATIONS[lang] || TRANSLATIONS['it'];
  const sym = CURRENCY_SYMBOLS[proforma?.currency || 'EUR'] || '€';
  const formatPrice = (n: number) => `${sym}${n.toLocaleString(lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'it-IT')}`;

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-white px-4">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-amber-500/50" />
          <h1 className="text-2xl font-bold mb-2">{t.notFound}</h1>
          <p className="text-gray-400">{t.notFoundDesc}</p>
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
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
          <div className="flex items-center justify-between">
            <img src="/lovable-uploads/vesuviano-logo-bianco.png" alt="Vesuviano" className="h-8 sm:h-10" />
            {proforma.proforma_number && (
              <span className="font-mono text-xs sm:text-sm text-amber-300/70">{proforma.proforma_number}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-100 mt-4">{t.proforma}</h1>
          {proforma.customer_name && (
            <p className="text-sm sm:text-lg text-amber-200/80 mt-1">
              {proforma.company_name ? `${proforma.company_name} — ` : ''}{proforma.customer_name}
            </p>
          )}
          {isPaid && (
            <Badge className="mt-3 bg-green-600 text-white text-sm px-3 py-1">
              <Check className="w-4 h-4 mr-1" /> {t.depositPaid}
            </Badge>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl space-y-4 sm:space-y-6">
        {items.map((item) => (
          <Card key={item.id} className="bg-[#222] border-amber-900/20 text-white overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              {(item.ai_render_url || item.image_url) && (
                <div className="w-full sm:w-48 md:w-64 h-40 sm:h-auto flex-shrink-0">
                  <img
                    src={item.ai_render_url || item.image_url || ''}
                    alt={item.model_name || item.custom_name || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-4 sm:p-6">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-amber-100 truncate">
                      {item.model_name || item.custom_name}
                    </h3>
                    {item.custom_description && (
                      <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2">{item.custom_description}</p>
                    )}
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-amber-400 whitespace-nowrap flex-shrink-0">
                    {formatPrice(item.line_total)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {item.fuel_type && (
                    <span className="text-xs bg-amber-900/30 text-amber-200 px-2 py-1 rounded-full">
                      🔥 {item.fuel_type}
                    </span>
                  )}
                  {item.diameter && (
                    <span className="text-xs bg-amber-900/30 text-amber-200 px-2 py-1 rounded-full">
                      Ø {item.diameter}cm
                    </span>
                  )}
                  {item.coating && (
                    <span className="text-xs bg-amber-900/30 text-amber-200 px-2 py-1 rounded-full">
                      🎨 {item.coating}
                    </span>
                  )}
                  {item.quantity > 1 && (
                    <span className="text-xs bg-amber-900/30 text-amber-200 px-2 py-1 rounded-full">
                      x{item.quantity}
                    </span>
                  )}
                </div>

                {item.item_type === 'oven' && item.image_url && !isPaid && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-amber-700 text-amber-300 hover:bg-amber-900/30 text-xs"
                    onClick={() => setEditingColorItem(item)}
                  >
                    <Palette className="w-3 h-3 mr-1" /> {t.customizeColor}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Summary & Payment */}
        <Card className="bg-[#222] border-amber-900/20 text-white">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex justify-between text-lg">
              <span className="text-gray-300">{t.total}</span>
              <span className="font-bold text-xl sm:text-2xl text-amber-100">{formatPrice(proforma.total_price)}</span>
            </div>

            <Separator className="bg-amber-900/30" />

            <div className="space-y-3">
              {proforma.payment_option === 'deposit_5' ? (
                <div className="bg-amber-900/20 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-amber-200 flex items-center gap-2 text-sm sm:text-base">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> {t.lockOffer} 5%
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    {t.pay} <span className="text-amber-300 font-bold">{formatPrice(proforma.deposit_amount)}</span> {t.lockOfferDesc}
                  </p>
                </div>
              ) : (
                <div className="bg-amber-900/20 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-amber-200 flex items-center gap-2 text-sm sm:text-base">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" /> {t.deposit50}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    {t.pay} <span className="text-amber-300 font-bold">{formatPrice(proforma.deposit_amount)}</span> {t.deposit50Desc}
                    {proforma.delivery_days && (
                      <> {t.shippedIn} <span className="text-amber-300 font-bold">{proforma.delivery_days} {t.days}</span>.</>
                    )}
                    {' '}{t.balanceAt} {formatPrice(proforma.total_price - proforma.deposit_amount)} {t.atDelivery}
                  </p>
                </div>
              )}
            </div>

            {proforma.notes && (
              <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400">{proforma.notes}</p>
              </div>
            )}

            {!isPaid && (
              <Button
                onClick={handlePayDeposit}
                disabled={paying}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-base sm:text-lg py-5 sm:py-6"
              >
                {paying ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                {t.payDeposit} — {formatPrice(proforma.deposit_amount)}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs sm:text-sm py-6 sm:py-8">
          <p>Vesuviano Forni — {t.tagline}</p>
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
