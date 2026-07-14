import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, FileText, Palette, CreditCard, Check, Truck, Shield, Flame, Pizza, PlayCircle, Image as ImageIcon, Download, Landmark, Copy } from 'lucide-react';
import ColorRenderGenerator from '@/components/configurator/ColorRenderGenerator';
import ImageZoomModal from '@/components/ImageZoomModal';
import SEOHead from '@/components/SEOHead';

interface ProformaItem {
  id: string;
  item_type: string;
  oven_id: string | null;
  burner_id: string | null;
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
  discount_percentage: number;
  discount_amount: number;
  delivery_days: number | null;
  payment_option: string;
  payment_status: string;
  notes: string | null;
  status: string;
  language: string;
  currency: string;
  price_list: string;
  valid_until: string | null;
  created_at: string;
  bank_account?: string;
}

interface OvenModel {
  id: string;
  model_name: string;
  fuel_type: string[];
  diameter: number;
  pizza_capacity: string;
  image_url: string;
  video_url_360?: string;
  additional_images?: string[];
  base_price_a: number;
  delivery_time_weeks: number;
  description: string | null;
  sizes?: Array<{
    diameter: number;
    pizza_capacity: string;
    datasheet_url?: string;
    datasheet_urls?: { it?: string; en?: string; fr?: string; de?: string; es?: string };
    coatings: Array<{
      name: string;
      image_url: string;
      video_url_360?: string;
      render_images?: string[];
      prices: {
        listA: { base: number; gas?: number; electric?: number };
        listB: { base: number; gas?: number; electric?: number };
        listC: { base: number; gas?: number; electric?: number };
      };
    }>;
  }>;
}

interface BurnerData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  price_b: number | null;
  price_c: number | null;
  image_url: string | null;
}

const getBurnerPrice = (burner: BurnerData, priceList: string): number => {
  if (priceList === 'C' && burner.price_c != null) return burner.price_c;
  if (priceList === 'B' && burner.price_b != null) return burner.price_b;
  return burner.price;
};

const TRANSLATIONS: Record<string, Record<string, string>> = {
  it: {
    proforma: 'Pro-Forma',
    depositPaid: 'Deposito Pagato',
    notFound: 'Pro-Forma non trovata',
    notFoundDesc: 'Il link potrebbe essere scaduto o non valido.',
    total: 'Totale',
    lockOffer: "Blocca l'offerta con il",
    lockOfferDesc: 'per bloccare questa offerta per 30 giorni.',
    lockOfferStep2: 'Per avviare l\'ordine: 45% del totale.',
    lockOfferStep3: 'Saldo: 50% a merce pronta per la spedizione.',
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
    selectSize: 'Scegli Dimensione',
    selectCoating: 'Scegli Rivestimento',
    selectFuel: 'Alimentazione',
    selectBurner: 'Scegli Bruciatore',
    noBurner: 'Senza Bruciatore',
    yourOven: 'Il Tuo Forno',
    photo: 'Foto',
    video360: 'Video 360°',
    configureYourOven: 'Configura il Tuo Forno',
    burner: 'Bruciatore',
    confirmConfig: 'Conferma Configurazione e Paga',
    payByCard: 'Paga con Carta',
    cardFeeNote: '+3,5% costo transazione carta',
    payByBankTransfer: 'Paga con Bonifico Bancario',
    bankTransferNoFee: 'Nessun costo aggiuntivo',
    orPayWith: 'oppure',
    bankDetailsTitle: 'Coordinate Bancarie per Bonifico',
    bankDetailsHolder: 'Intestatario',
    bankDetailsBank: 'Banca',
    bankDetailsIBAN: 'IBAN',
    bankDetailsBIC: 'BIC/SWIFT',
    bankDetailsCausale: 'Causale',
    bankDetailsCausaleValue: 'Inserire il numero di proforma come causale del bonifico.',
    bankDetailsWiseTip: 'Per bonifici internazionali consigliamo di utilizzare Wise (wise.com) per commissioni ridotte e tempi rapidi.',
    copied: 'Copiato!',
    preSelected: 'Pre-selezionato',
    changeSelection: 'Cambia',
    subtotal: 'Subtotale',
    discount: 'Sconto',
    downloadDatasheet: 'Scarica Scheda Tecnica',
    termsTitle: 'Termini e Condizioni',
    termsPallet: 'La consegna ed il posizionamento del forno prevedono comunque l\'utilizzo da parte del ricevente di un transpallet con capacità di carico di 2000kg per lo spostamento interno. È pertanto fortemente consigliato prevedere la disponibilità vostra di un transpallet con capacità di carico indicata entro la data di consegna prevista.',
    termsCourier: 'Generalmente, il corriere vi contatterà 1/2 giorni prima della consegna.',
    termsDelay: 'La data di consegna prevista indicata può variare di 5/7 giorni a causa di ritardi doganali nell\'analisi merce o a causa di ritardi nel trasporto.',
    termsRefund: 'Qualora l\'acquirente avesse intenzione di ritirare l\'ordine prima della partenza del forno, avrà diritto al 90% della quota di deposito versata.',
    paymentMethodTitle: 'Modalità di Pagamento',
    paymentMethodDeposit: 'Il deposito si paga con carta di credito/debito tramite Stripe.',
    paymentMethodBalance: 'Il saldo restante si paga tramite bonifico bancario o app WIRE.',
  },
  en: {
    proforma: 'Pro-Forma Invoice',
    depositPaid: 'Deposit Paid',
    notFound: 'Pro-Forma not found',
    notFoundDesc: 'The link may have expired or is invalid.',
    total: 'Total',
    lockOffer: 'Lock the offer with',
    lockOfferDesc: 'to lock this offer for 30 days.',
    lockOfferStep2: 'To start the order: 45% of the total.',
    lockOfferStep3: 'Balance: 50% when goods are ready for shipping.',
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
    selectSize: 'Choose Size',
    selectCoating: 'Choose Coating',
    selectFuel: 'Fuel Type',
    selectBurner: 'Choose Burner',
    noBurner: 'No Burner',
    yourOven: 'Your Oven',
    photo: 'Photo',
    video360: '360° Video',
    configureYourOven: 'Configure Your Oven',
    burner: 'Burner',
    confirmConfig: 'Confirm Configuration & Pay',
    payByCard: 'Pay by Card',
    cardFeeNote: '+3.5% card transaction fee',
    payByBankTransfer: 'Pay by Bank Transfer',
    bankTransferNoFee: 'No additional fees',
    orPayWith: 'or',
    bankDetailsTitle: 'Bank Transfer Details (via Wise)',
    bankDetailsHolder: 'Account Holder',
    bankDetailsBank: 'Bank',
    bankDetailsIBAN: 'IBAN',
    bankDetailsBIC: 'BIC/SWIFT',
    bankDetailsCausale: 'Reference',
    bankDetailsCausaleValue: 'Please use the proforma number as the payment reference.',
    bankDetailsWiseTip: 'We use Wise for fast international payments with very low fees.',
    bankDetailsAccountNumber: 'Account Number',
    bankDetailsSortCode: 'Sort Code',
    copied: 'Copied!',
    preSelected: 'Pre-selected',
    changeSelection: 'Change',
    subtotal: 'Subtotal',
    discount: 'Discount',
    downloadDatasheet: 'Download Technical Datasheet',
    termsTitle: 'Terms and Conditions',
    termsPallet: 'Delivery and positioning of the oven require the recipient to have a pallet jack with a load capacity of 2000kg for internal movement. It is therefore strongly recommended to ensure the availability of a pallet jack with the indicated load capacity by the expected delivery date.',
    termsCourier: 'Generally, the carrier will contact you 1-2 days before delivery.',
    termsDelay: 'The indicated expected delivery date may vary by 5-7 days due to customs delays in goods analysis or transport delays.',
    termsRefund: 'Should the buyer wish to withdraw the order before the oven is shipped, they will be entitled to 90% of the deposit paid.',
    paymentMethodTitle: 'Payment Methods',
    paymentMethodDeposit: 'The deposit is paid by credit/debit card via Stripe.',
    paymentMethodBalance: 'The remaining balance is paid via bank transfer or WIRE app.',
  },
  fr: {
    proforma: 'Facture Pro-Forma',
    depositPaid: 'Acompte Payé',
    notFound: 'Pro-Forma introuvable',
    notFoundDesc: 'Le lien a peut-être expiré ou est invalide.',
    total: 'Total',
    lockOffer: "Bloquez l'offre avec",
    lockOfferDesc: "pour bloquer cette offre pendant 30 jours.",
    lockOfferStep2: 'Pour lancer la commande : 45% du total.',
    lockOfferStep3: 'Solde : 50% quand la marchandise est prête à être expédiée.',
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
    selectSize: 'Choisir la Taille',
    selectCoating: 'Choisir le Revêtement',
    selectFuel: 'Type de Combustible',
    selectBurner: 'Choisir le Brûleur',
    noBurner: 'Sans Brûleur',
    yourOven: 'Votre Four',
    photo: 'Photo',
    video360: 'Vidéo 360°',
    configureYourOven: 'Configurez Votre Four',
    burner: 'Brûleur',
    confirmConfig: 'Confirmer et Payer',
    payByCard: 'Payer par Carte',
    cardFeeNote: '+3,5% frais de transaction carte',
    payByBankTransfer: 'Payer par Virement Bancaire',
    bankTransferNoFee: 'Aucun frais supplémentaire',
    orPayWith: 'ou',
    bankDetailsTitle: 'Coordonnées Bancaires pour Virement',
    bankDetailsHolder: 'Titulaire',
    bankDetailsBank: 'Banque',
    bankDetailsIBAN: 'IBAN',
    bankDetailsBIC: 'BIC/SWIFT',
    bankDetailsCausale: 'Référence',
    bankDetailsCausaleValue: 'Veuillez indiquer le numéro de proforma comme référence du virement.',
    bankDetailsWiseTip: 'Pour les virements internationaux, nous recommandons Wise (wise.com) pour des frais réduits et un traitement rapide.',
    copied: 'Copié !',
    preSelected: 'Pré-sélectionné',
    changeSelection: 'Modifier',
    subtotal: 'Sous-total',
    discount: 'Remise',
    downloadDatasheet: 'Télécharger la Fiche Technique',
    termsTitle: 'Conditions Générales',
    termsPallet: 'La livraison et le positionnement du four nécessitent l\'utilisation par le destinataire d\'un transpalette d\'une capacité de charge de 2000 kg pour le déplacement interne. Il est donc fortement recommandé de prévoir la disponibilité d\'un transpalette avec la capacité de charge indiquée avant la date de livraison prévue.',
    termsCourier: 'Généralement, le transporteur vous contactera 1 à 2 jours avant la livraison.',
    termsDelay: 'La date de livraison prévue indiquée peut varier de 5 à 7 jours en raison de retards douaniers dans l\'analyse des marchandises ou de retards de transport.',
    termsRefund: 'Si l\'acheteur souhaite annuler la commande avant l\'expédition du four, il aura droit à 90% du dépôt versé.',
    paymentMethodTitle: 'Modes de Paiement',
    paymentMethodDeposit: 'L\'acompte est payé par carte de crédit/débit via Stripe.',
    paymentMethodBalance: 'Le solde restant est payé par virement bancaire ou application WIRE.',
  },
  de: {
    proforma: 'Pro-Forma Rechnung',
    depositPaid: 'Anzahlung Bezahlt',
    notFound: 'Pro-Forma nicht gefunden',
    notFoundDesc: 'Der Link ist möglicherweise abgelaufen oder ungültig.',
    total: 'Gesamt',
    lockOffer: 'Sichern Sie das Angebot mit',
    lockOfferDesc: 'um dieses Angebot für 30 Tage zu sichern.',
    lockOfferStep2: 'Zur Auftragserteilung: 45% des Gesamtbetrags.',
    lockOfferStep3: 'Restbetrag: 50% bei versandfertiger Ware.',
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
    selectSize: 'Größe Wählen',
    selectCoating: 'Beschichtung Wählen',
    selectFuel: 'Brennstoffart',
    selectBurner: 'Brenner Wählen',
    noBurner: 'Ohne Brenner',
    yourOven: 'Ihr Ofen',
    photo: 'Foto',
    video360: '360° Video',
    configureYourOven: 'Konfigurieren Sie Ihren Ofen',
    burner: 'Brenner',
    confirmConfig: 'Bestätigen & Bezahlen',
    payByCard: 'Mit Karte bezahlen',
    cardFeeNote: '+3,5% Kartentransaktionsgebühr',
    payByBankTransfer: 'Per Banküberweisung bezahlen',
    bankTransferNoFee: 'Keine zusätzlichen Gebühren',
    orPayWith: 'oder',
    bankDetailsTitle: 'Bankverbindung für Überweisung',
    bankDetailsHolder: 'Kontoinhaber',
    bankDetailsBank: 'Bank',
    bankDetailsIBAN: 'IBAN',
    bankDetailsBIC: 'BIC/SWIFT',
    bankDetailsCausale: 'Verwendungszweck',
    bankDetailsCausaleValue: 'Bitte geben Sie die Proforma-Nummer als Verwendungszweck an.',
    bankDetailsWiseTip: 'Für internationale Überweisungen empfehlen wir Wise (wise.com) für niedrigere Gebühren und schnellere Abwicklung.',
    copied: 'Kopiert!',
    preSelected: 'Vorausgewählt',
    changeSelection: 'Ändern',
    subtotal: 'Zwischensumme',
    discount: 'Rabatt',
    downloadDatasheet: 'Technisches Datenblatt Herunterladen',
    termsTitle: 'Allgemeine Geschäftsbedingungen',
    termsPallet: 'Die Lieferung und Positionierung des Ofens erfordern die Verwendung eines Hubwagens mit einer Tragfähigkeit von 2000 kg durch den Empfänger für die interne Bewegung. Es wird daher dringend empfohlen, die Verfügbarkeit eines Hubwagens mit der angegebenen Tragfähigkeit bis zum voraussichtlichen Lieferdatum sicherzustellen.',
    termsCourier: 'In der Regel wird der Spediteur Sie 1-2 Tage vor der Lieferung kontaktieren.',
    termsDelay: 'Das angegebene voraussichtliche Lieferdatum kann aufgrund von Zollverzögerungen bei der Warenprüfung oder Transportverzögerungen um 5-7 Tage abweichen.',
    termsRefund: 'Sollte der Käufer die Bestellung vor dem Versand des Ofens stornieren wollen, hat er Anspruch auf 90% der geleisteten Anzahlung.',
    paymentMethodTitle: 'Zahlungsmethoden',
    paymentMethodDeposit: 'Die Anzahlung wird per Kredit-/Debitkarte über Stripe bezahlt.',
    paymentMethodBalance: 'Der Restbetrag wird per Banküberweisung oder WIRE-App bezahlt.',
  },
  es: {
    proforma: 'Factura Pro-Forma',
    depositPaid: 'Depósito Pagado',
    notFound: 'Pro-Forma no encontrada',
    notFoundDesc: 'El enlace puede haber expirado o no es válido.',
    total: 'Total',
    lockOffer: 'Bloquea la oferta con el',
    lockOfferDesc: 'para bloquear esta oferta durante 30 días.',
    lockOfferStep2: 'Para iniciar el pedido: 45% del total.',
    lockOfferStep3: 'Saldo: 50% cuando la mercancía esté lista para envío.',
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
    selectSize: 'Elegir Tamaño',
    selectCoating: 'Elegir Revestimiento',
    selectFuel: 'Tipo de Combustible',
    selectBurner: 'Elegir Quemador',
    noBurner: 'Sin Quemador',
    yourOven: 'Tu Horno',
    photo: 'Foto',
    video360: 'Video 360°',
    configureYourOven: 'Configura Tu Horno',
    burner: 'Quemador',
    confirmConfig: 'Confirmar y Pagar',
    payByCard: 'Pagar con Tarjeta',
    cardFeeNote: '+3,5% coste de transacción con tarjeta',
    payByBankTransfer: 'Pagar por Transferencia Bancaria',
    bankTransferNoFee: 'Sin costes adicionales',
    orPayWith: 'o',
    bankDetailsTitle: 'Datos Bancarios para Transferencia',
    bankDetailsHolder: 'Titular',
    bankDetailsBank: 'Banco',
    bankDetailsIBAN: 'IBAN',
    bankDetailsBIC: 'BIC/SWIFT',
    bankDetailsCausale: 'Concepto',
    bankDetailsCausaleValue: 'Indique el número de proforma como concepto de la transferencia.',
    bankDetailsWiseTip: 'Para transferencias internacionales recomendamos usar Wise (wise.com) para comisiones reducidas y rapidez.',
    copied: '¡Copiado!',
    preSelected: 'Pre-seleccionado',
    changeSelection: 'Cambiar',
    subtotal: 'Subtotal',
    discount: 'Descuento',
    downloadDatasheet: 'Descargar Ficha Técnica',
    termsTitle: 'Términos y Condiciones',
    termsPallet: 'La entrega y colocación del horno requieren el uso por parte del destinatario de un transpaleta con capacidad de carga de 2000 kg para el movimiento interno. Por lo tanto, se recomienda encarecidamente prever la disponibilidad de un transpaleta con la capacidad de carga indicada antes de la fecha de entrega prevista.',
    termsCourier: 'Generalmente, el transportista le contactará 1-2 días antes de la entrega.',
    termsDelay: 'La fecha de entrega prevista indicada puede variar en 5-7 días debido a retrasos aduaneros en el análisis de mercancías o retrasos en el transporte.',
    termsRefund: 'Si el comprador desea retirar el pedido antes del envío del horno, tendrá derecho al 90% del depósito abonado.',
    paymentMethodTitle: 'Métodos de Pago',
    paymentMethodDeposit: 'El depósito se paga con tarjeta de crédito/débito a través de Stripe.',
    paymentMethodBalance: 'El saldo restante se paga mediante transferencia bancaria o aplicación WIRE.',
  },
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ',
};

// Per-oven-item configuration state
interface ItemConfig {
  fuelType: string;
  diameter: number | null;
  coating: string;
  showPhotoGallery: boolean;
  colorRenderUrl: string;
  selectedColor: string;
}

const ProformaPage = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const [proforma, setProforma] = useState<ProformaData | null>(null);
  const [items, setItems] = useState<ProformaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [ovenModels, setOvenModels] = useState<OvenModel[]>([]);
  const [burners, setBurners] = useState<BurnerData[]>([]);
  const [itemConfigs, setItemConfigs] = useState<Record<string, ItemConfig>>({});
  const [selectedBurnerId, setSelectedBurnerId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; alt: string } | null>(null);
  const [showBankDetails, setShowBankDetails] = useState(false);

  useEffect(() => {
    if (token) {
      if (searchParams.get('payment') === 'success') {
        verifyPayment().then(() => loadAll());
      } else {
        loadAll();
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

  const loadAll = async () => {
    setLoading(true);
    
    // Load proforma
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

    // Load items, ovens and burners in parallel
    const [itemsRes, ovensRes, burnersRes] = await Promise.all([
      supabase.from('proforma_items').select('*').eq('proforma_id', proformaData.id).order('sort_order'),
      supabase.from('configurator_ovens').select('*').eq('is_active', true),
      supabase.from('burners').select('*').eq('is_active', true),
    ]);

    const loadedItems = (itemsRes.data || []) as any as ProformaItem[];
    setItems(loadedItems);
    setOvenModels((ovensRes.data || []) as any as OvenModel[]);
    setBurners((burnersRes.data || []) as any as BurnerData[]);

    // Initialize config state from pre-selected values
    const configs: Record<string, ItemConfig> = {};
    loadedItems.forEach(item => {
      if (item.item_type === 'oven') {
        configs[item.id] = {
          fuelType: item.fuel_type || '',
          diameter: item.diameter,
          coating: item.coating || '',
          showPhotoGallery: true,
          colorRenderUrl: item.ai_render_url || '',
          selectedColor: '',
        };
      }
    });
    setItemConfigs(configs);

    // Check if there's a pre-selected burner
    const burnerItem = loadedItems.find(i => i.item_type === 'burner');
    if (burnerItem) setSelectedBurnerId(burnerItem.burner_id);

    setLoading(false);
  };

  const getOvenForModel = (modelName: string) => {
    return ovenModels.find(o => o.model_name === modelName);
  };

  const getPrice = useCallback((oven: OvenModel, fuelType: string, diameter: number, coatingName: string, pl: string) => {
    if (!oven?.sizes) return oven?.base_price_a || 0;
    const size = oven.sizes.find(s => s.diameter === diameter);
    if (!size) return oven.base_price_a || 0;
    const coating = size.coatings?.find(c => c.name === coatingName) || size.coatings?.[0];
    if (!coating?.prices) return oven.base_price_a || 0;
    
    const priceKey = `list${pl}` as 'listA' | 'listB' | 'listC';
    const prices = coating.prices[priceKey];
    if (!prices) return oven.base_price_a || 0;
    
    if (fuelType === 'Gas') return prices.gas || prices.base || 0;
    if (fuelType === 'Elettrico') return prices.electric || prices.base || 0;
    return prices.base || 0;
  }, []);

  const getCoatingData = (oven: OvenModel, diameter: number, coatingName: string) => {
    if (!oven?.sizes) return null;
    const size = oven.sizes.find(s => s.diameter === diameter);
    if (!size) return null;
    return size.coatings?.find(c => c.name === coatingName) || size.coatings?.[0] || null;
  };

  const updateItemConfig = (itemId: string, updates: Partial<ItemConfig>) => {
    setItemConfigs(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...updates },
    }));
  };

  // Check if burners should be available: show if there's already a burner item in the proforma OR if fuel type requires it
  const hasBurnerItem = items.some(i => i.item_type === 'burner');
  const shouldShowBurners = hasBurnerItem || items.some(i => i.item_type === 'oven' && itemConfigs[i.id]?.fuelType && itemConfigs[i.id].fuelType !== 'Legna' && itemConfigs[i.id].fuelType !== 'Elettrico');

  // Calculate total from current configurations
  const calculateTotal = () => {
    if (!proforma) return 0;
    const pl = (proforma as any).price_list || 'A';
    let total = 0;

    items.forEach(item => {
      if (item.item_type === 'oven') {
        const config = itemConfigs[item.id];
        const oven = getOvenForModel(item.model_name || '');
        if (oven && config?.diameter && config?.coating) {
          total += getPrice(oven, config.fuelType, config.diameter, config.coating, pl) * item.quantity;
        } else {
          total += item.line_total;
        }
      } else if (item.item_type === 'burner') {
        // Only include burner cost if burners are applicable (not for Legna/Elettrico)
        if (shouldShowBurners) {
          if (selectedBurnerId) {
            const burner = burners.find(b => b.id === selectedBurnerId);
            total += (burner ? getBurnerPrice(burner, pl) : item.unit_price) * item.quantity;
          } else {
            total += item.unit_price * item.quantity;
          }
        }
      } else {
        total += item.line_total;
      }
    });

    // If customer selected a burner but there wasn't one in the original items
    if (shouldShowBurners && selectedBurnerId && !items.find(i => i.item_type === 'burner')) {
      const burner = burners.find(b => b.id === selectedBurnerId);
      if (burner) total += getBurnerPrice(burner, pl);
    }

    return total;
  };

  const handlePayDeposit = async () => {
    if (!proforma) return;

    // Save customer's configuration first
    const pl = (proforma as any).price_list || 'A';
    
    for (const item of items) {
      if (item.item_type === 'oven') {
        const config = itemConfigs[item.id];
        const oven = getOvenForModel(item.model_name || '');
        if (config && oven) {
          const coatingData = getCoatingData(oven, config.diameter || 0, config.coating);
          const price = getPrice(oven, config.fuelType, config.diameter || 0, config.coating, pl);
          await supabase
            .from('proforma_items')
            .update({
              fuel_type: config.fuelType,
              diameter: config.diameter,
              coating: config.coating,
              image_url: coatingData?.image_url || item.image_url,
              ai_render_url: config.colorRenderUrl || item.ai_render_url,
              unit_price: price,
              line_total: price * item.quantity,
            })
            .eq('id', item.id);
        }
      }
    }

    // Handle burner selection changes
    if (selectedBurnerId) {
      const existingBurnerItem = items.find(i => i.item_type === 'burner');
      const burner = burners.find(b => b.id === selectedBurnerId);
      if (burner) {
        if (existingBurnerItem) {
          await supabase.from('proforma_items').update({
            burner_id: burner.id,
            model_name: burner.name,
            custom_description: burner.description,
            image_url: burner.image_url,
            unit_price: getBurnerPrice(burner, pl),
            line_total: getBurnerPrice(burner, pl),
          }).eq('id', existingBurnerItem.id);
        } else {
          await supabase.from('proforma_items').insert({
            proforma_id: proforma.id,
            item_type: 'burner',
            burner_id: burner.id,
            model_name: burner.name,
            custom_description: burner.description,
            image_url: burner.image_url,
            unit_price: getBurnerPrice(burner, pl),
            quantity: 1,
            line_total: getBurnerPrice(burner, pl),
            sort_order: items.length,
          });
        }
      }
    }

    // Update proforma total (with discount applied)
    const newSubtotal = calculateTotal();
    const discPct = (proforma as any).discount_percentage || 0;
    const newDiscount = newSubtotal * (discPct / 100);
    const newTotal = newSubtotal - newDiscount;
    const newDeposit = newTotal * (proforma.deposit_percentage / 100);
    await supabase.from('proformas').update({
      total_price: newTotal,
      discount_amount: newDiscount,
      deposit_amount: newDeposit,
    }).eq('id', proforma.id);

    // Proceed to payment
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
  const pl = (proforma as any)?.price_list || 'A';
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
  const currentSubtotal = calculateTotal();
  const discountPct = (proforma as any).discount_percentage || 0;
  const currentDiscount = currentSubtotal * (discountPct / 100);
  const currentTotal = currentSubtotal - currentDiscount;
  const currentDeposit = currentTotal * (proforma.deposit_percentage / 100);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2a1810] to-[#1a1a1a] border-b border-amber-900/30">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
          <div className="flex items-center justify-between">
            <img src="https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/site/vesuviano-logo-bianco.png" alt="Vesuviano" className="h-8 sm:h-10" />
            {proforma.proforma_number && (
              <span className="font-mono text-xs sm:text-sm text-amber-300/70">{proforma.proforma_number}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-100 mt-4">{t.configureYourOven}</h1>
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

      {/* Configurator Content */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl space-y-6 sm:space-y-8">
        
        {/* Oven Items - Each with its own configurator */}
        {items.filter(item => item.item_type === 'oven').map((item) => {
          const oven = getOvenForModel(item.model_name || '');
          const config = itemConfigs[item.id];
          if (!oven || !config) return null;

          const availableFuelTypes = Array.from(new Set(
            ovenModels.filter(o => o.model_name === item.model_name).flatMap(o => o.fuel_type)
          ));
          
          const allSizes = oven.sizes || [];
          const allowedSizes: number[] = (item.specifications as any)?.allowed_sizes || [];
          const availableSizes = allowedSizes.length > 0
            ? allSizes.filter(s => allowedSizes.includes(s.diameter))
            : allSizes;
          const selectedSize = availableSizes.find(s => s.diameter === config.diameter);
          const availableCoatings = selectedSize?.coatings || [];
          const selectedCoatingData = availableCoatings.find(c => c.name === config.coating) || availableCoatings[0];
          const currentImage = config.colorRenderUrl || selectedCoatingData?.image_url || oven.image_url;
          const currentVideo = selectedCoatingData?.video_url_360 || oven.video_url_360;
          const itemPrice = getPrice(oven, config.fuelType, config.diameter || 0, config.coating, pl);

          return (
            <div key={item.id} className="space-y-5">
              {/* Model Header */}
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-amber-100">{item.model_name}</h2>
                {oven.description && (
                  <p className="text-sm text-gray-400 mt-1">{oven.description}</p>
                )}
              </div>

              {/* Fuel Type Display (read-only, set by admin) */}
              {config.fuelType && (
                <div className="flex items-center gap-2 bg-amber-900/20 rounded-lg px-4 py-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-100">{t.selectFuel}: <strong>{config.fuelType}</strong></span>
                </div>
              )}

              {/* Size Selection */}
              {availableSizes.length > 0 && !isPaid && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-200 mb-3">{t.selectSize}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {availableSizes.map(size => (
                      <button
                        key={size.diameter}
                        onClick={() => {
                          const firstCoating = size.coatings?.[0]?.name || '';
                          updateItemConfig(item.id, { 
                            diameter: size.diameter, 
                            coating: firstCoating,
                            colorRenderUrl: '',
                            selectedColor: '',
                          });
                        }}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          config.diameter === size.diameter
                            ? 'border-amber-500 bg-amber-900/30 text-amber-100'
                            : 'border-gray-700 bg-[#222] text-gray-300 hover:border-amber-700'
                        }`}
                      >
                        <Pizza className="w-6 h-6 mx-auto mb-1 text-amber-400" />
                        <div className="font-bold text-lg">{size.diameter}cm</div>
                        <div className="text-[10px] text-gray-400">{size.pizza_capacity}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Coating Selection */}
              {availableCoatings.length > 0 && config.diameter && !isPaid && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-200 mb-3">{t.selectCoating}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableCoatings.map(coating => (
                      <button
                        key={coating.name}
                        onClick={() => updateItemConfig(item.id, { 
                          coating: coating.name,
                          colorRenderUrl: '',
                          selectedColor: '',
                        })}
                        className={`rounded-lg border overflow-hidden transition-all ${
                          config.coating === coating.name
                            ? 'border-amber-500 ring-2 ring-amber-500/30'
                            : 'border-gray-700 hover:border-amber-700'
                        }`}
                      >
                        <div className="aspect-square bg-[#222]">
                          <img src={coating.image_url} alt={coating.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2 bg-[#222] text-center">
                          <span className="text-xs font-medium text-gray-200">{coating.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Oven Media Gallery */}
              {selectedCoatingData && (
                <Card className="bg-[#222] border-amber-900/20 overflow-hidden">
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <h3 className="font-semibold text-amber-100 text-lg">{t.yourOven}</h3>
                    
                    {/* Media Toggle */}
                    {currentVideo && (
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant={config.showPhotoGallery ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateItemConfig(item.id, { showPhotoGallery: true })}
                          className={config.showPhotoGallery ? "bg-amber-600 hover:bg-amber-700" : "border-amber-700 text-amber-300"}
                        >
                          <ImageIcon className="w-4 h-4 mr-1" /> {t.photo}
                        </Button>
                        <Button
                          variant={!config.showPhotoGallery ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateItemConfig(item.id, { showPhotoGallery: false })}
                          className={!config.showPhotoGallery ? "bg-amber-600 hover:bg-amber-700" : "border-amber-700 text-amber-300"}
                        >
                          <PlayCircle className="w-4 h-4 mr-1" /> {t.video360}
                        </Button>
                      </div>
                    )}

                    {/* Main Display */}
                    <div className="aspect-[4/5] sm:aspect-[3/4] md:aspect-video relative overflow-hidden rounded-lg border border-amber-900/20 bg-[#1a1a1a]">
                      {!config.showPhotoGallery && currentVideo ? (
                        <video autoPlay loop muted playsInline controls className="w-full h-full object-contain">
                          <source src={currentVideo} />
                        </video>
                      ) : (
                        <img
                          src={currentImage}
                          alt={item.model_name || ''}
                          className="w-full h-full object-contain p-2 sm:p-4 cursor-pointer"
                          onClick={() => setZoomedImage({ url: currentImage, alt: item.model_name || '' })}
                        />
                      )}
                    </div>

                    {/* Render images gallery */}
                    {config.showPhotoGallery && selectedCoatingData?.render_images && selectedCoatingData.render_images.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {selectedCoatingData.render_images.map((img, idx) => (
                          <div
                            key={idx}
                            className="aspect-square rounded border border-amber-900/20 overflow-hidden cursor-pointer hover:opacity-80 bg-[#1a1a1a]"
                            onClick={() => setZoomedImage({ url: img, alt: `${item.model_name} - ${idx + 1}` })}
                          >
                            <img src={img} alt="" className="w-full h-full object-contain p-1" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Price display */}
                    <div className="flex items-center justify-between bg-amber-900/20 rounded-lg p-4">
                      <div>
                        <p className="text-xs text-gray-400">{item.model_name} — {config.fuelType} Ø{config.diameter}cm</p>
                        <p className="text-xs text-gray-500">{config.coating}</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-400">{formatPrice(itemPrice)}</p>
                    </div>

                  </CardContent>
                </Card>
              )}

              {/* Color Render Generator */}
              {selectedCoatingData && !isPaid && (
                <div className="bg-[#222] border border-amber-900/20 rounded-lg p-4">
                  <ColorRenderGenerator
                    ovenName={item.model_name || ''}
                    ovenImageUrl={selectedCoatingData.image_url || oven.image_url}
                    selectedCoating={config.coating}
                    onRenderGenerated={(imageUrl, color) => {
                      updateItemConfig(item.id, { colorRenderUrl: imageUrl, selectedColor: color });
                      // Save to DB
                      supabase.from('proforma_items').update({ ai_render_url: imageUrl }).eq('id', item.id);
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Burner Selection - only show for Gas/Elettrico fuel types */}
        {burners.length > 0 && !isPaid && shouldShowBurners && (
          <div>
            <h3 className="text-lg font-semibold text-amber-100 mb-4">{t.selectBurner}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* No burner option */}
              <button
                onClick={() => setSelectedBurnerId(null)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  !selectedBurnerId
                    ? 'border-amber-500 bg-amber-900/30'
                    : 'border-gray-700 bg-[#222] hover:border-amber-700'
                }`}
              >
                <span className="text-sm font-medium text-gray-300">{t.noBurner}</span>
              </button>

              {burners.map(burner => (
                <button
                  key={burner.id}
                  onClick={() => setSelectedBurnerId(burner.id)}
                  className={`p-3 rounded-lg border text-left transition-all flex gap-3 ${
                    selectedBurnerId === burner.id
                      ? 'border-amber-500 bg-amber-900/30'
                      : 'border-gray-700 bg-[#222] hover:border-amber-700'
                  }`}
                >
                  {burner.image_url && (
                    <img src={burner.image_url} alt={burner.name} className="w-16 h-16 object-cover rounded flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-amber-100">{burner.name}</p>
                    {burner.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{burner.description}</p>
                    )}
                    <p className="text-sm font-bold text-amber-400 mt-1">{formatPrice(getBurnerPrice(burner, pl))}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Items (read-only) */}
        {items.filter(i => i.item_type === 'custom').map(item => (
          <Card key={item.id} className="bg-[#222] border-amber-900/20 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-amber-100">{item.custom_name}</h3>
                  {item.custom_description && <p className="text-xs text-gray-400">{item.custom_description}</p>}
                </div>
                <span className="text-lg font-bold text-amber-400">{formatPrice(item.line_total)}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Summary & Payment */}
        <Card className="bg-[#222] border-amber-900/20 text-white">
          <CardContent className="p-4 sm:p-6 space-y-4">
            {/* Items summary */}
            <div className="space-y-2">
              {items.filter(i => i.item_type === 'oven').map(item => {
                const config = itemConfigs[item.id];
                const oven = getOvenForModel(item.model_name || '');
                const price = oven && config ? getPrice(oven, config.fuelType, config.diameter || 0, config.coating, pl) : item.line_total;
                return (

    <>
      <SEOHead title="Pro-Forma | Vesuviano" description="Pro-forma cliente Vesuviano." lang="it" noIndex />
      <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {item.model_name} — {config?.fuelType} Ø{config?.diameter}cm
                    </span>
                    <span className="text-amber-200 font-semibold">{formatPrice(price * item.quantity)}</span>
                  </div>
    </>
  );
              })}
              {shouldShowBurners && selectedBurnerId && (() => {
                const burner = burners.find(b => b.id === selectedBurnerId);
                return burner ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{t.burner}: {burner.name}</span>
                    <span className="text-amber-200 font-semibold">{formatPrice(getBurnerPrice(burner, pl))}</span>
                  </div>
                ) : null;
              })()}
              {items.filter(i => i.item_type === 'custom').map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.custom_name}</span>
                  <span className="text-amber-200 font-semibold">{formatPrice(item.line_total)}</span>
                </div>
              ))}
            </div>

            <Separator className="bg-amber-900/30" />

            {discountPct > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t.subtotal}</span>
                  <span className="text-gray-400">{formatPrice(currentSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-400">
                  <span>{t.discount} ({discountPct}%)</span>
                  <span>-{formatPrice(currentDiscount)}</span>
                </div>
                <Separator className="bg-amber-900/30" />
              </>
            )}

            <div className="flex justify-between text-lg">
              <span className="text-gray-300">{t.total}</span>
              <span className="font-bold text-xl sm:text-2xl text-amber-100">{formatPrice(currentTotal)}</span>
            </div>

            <Separator className="bg-amber-900/30" />

            <div className="space-y-3">
              {proforma.payment_option === 'deposit_5' ? (
                <div className="bg-amber-900/20 rounded-lg p-3 sm:p-4 space-y-2">
                  <h4 className="font-semibold text-amber-200 flex items-center gap-2 text-sm sm:text-base">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> {t.lockOffer} 5%
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-400">
                    1️⃣ {t.pay} <span className="text-amber-300 font-bold">{formatPrice(currentDeposit)}</span> {t.lockOfferDesc}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    2️⃣ {t.lockOfferStep2} <span className="text-amber-300 font-bold">{formatPrice(currentTotal * 0.45)}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    3️⃣ {t.lockOfferStep3} <span className="text-amber-300 font-bold">{formatPrice(currentTotal * 0.50)}</span>
                  </p>
                </div>
              ) : (
                <div className="bg-amber-900/20 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-amber-200 flex items-center gap-2 text-sm sm:text-base">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" /> {t.deposit50}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    {t.pay} <span className="text-amber-300 font-bold">{formatPrice(currentDeposit)}</span> {t.deposit50Desc}
                    {proforma.delivery_days && (
                      <> {t.shippedIn} <span className="text-amber-300 font-bold">{proforma.delivery_days} {t.days}</span>.</>
                    )}
                    {' '}{t.balanceAt} {formatPrice(currentTotal - currentDeposit)} {t.atDelivery}
                  </p>
                </div>
              )}
            </div>

            {proforma.notes && (
              <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400">{proforma.notes}</p>
              </div>
            )}

            {/* Payment Methods */}
            <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 space-y-2">
              <h4 className="font-semibold text-amber-200 text-xs sm:text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> {t.paymentMethodTitle}
              </h4>
              <ul className="space-y-1.5 text-[10px] sm:text-xs text-gray-400 list-disc list-inside">
                <li>{t.paymentMethodDeposit}</li>
                <li>{t.paymentMethodBalance}</li>
              </ul>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 space-y-3">
              <h4 className="font-semibold text-amber-200 text-xs sm:text-sm">{t.termsTitle}</h4>
              <ul className="space-y-2 text-[10px] sm:text-xs text-gray-500 list-disc list-inside">
                <li>{t.termsPallet}</li>
                <li>{t.termsCourier}</li>
                <li>{t.termsDelay}</li>
                <li>{t.termsRefund}</li>
              </ul>
            </div>

            {!isPaid && (
              <div className="space-y-4">
                {/* Card Payment - Primary */}
                <Button
                  onClick={() => handlePayDeposit()}
                  disabled={paying}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-base sm:text-lg py-5 sm:py-6"
                >
                  {paying ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5 mr-2" />
                  )}
                  {t.payByCard} — {formatPrice(Math.round(currentDeposit * 1.035 * 100) / 100)}
                </Button>
                <p className="text-center text-gray-400 text-xs -mt-2">{t.cardFeeNote}</p>

                <div className="flex items-center gap-3">
                  <Separator className="flex-1 bg-gray-700" />
                  <span className="text-xs text-gray-500 uppercase">{t.orPayWith}</span>
                  <Separator className="flex-1 bg-gray-700" />
                </div>

                {/* Bank Transfer - Secondary */}
                <Button
                  onClick={() => setShowBankDetails(!showBankDetails)}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 text-base sm:text-lg py-5 sm:py-6"
                >
                  <Landmark className="w-5 h-5 mr-2" />
                  {t.payByBankTransfer} — {formatPrice(currentDeposit)}
                </Button>
                <p className="text-center text-green-400 text-xs -mt-2">✓ {t.bankTransferNoFee}</p>

                {showBankDetails && (
                  <div className="bg-gray-800/80 border border-amber-600/30 rounded-lg p-4 sm:p-5 space-y-3 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    <h4 className="text-amber-400 font-semibold text-base">{t.bankDetailsTitle}</h4>
                    <div className="space-y-2 text-gray-300">
                      {(proforma?.bank_account === 'wise_uk' || (!proforma?.bank_account && lang === 'en')) ? (
                        <>
                          {/* UK Wise Account for English proformas */}
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t.bankDetailsHolder}:</span>
                            <span className="font-medium text-right">Unita 1 di Stanislao Elefante</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">{(t as any).bankDetailsAccountNumber || 'Account Number'}:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">62531858</span>
                              <button
                                onClick={() => { navigator.clipboard.writeText('62531858'); toast.success(t.copied); }}
                                className="text-amber-400 hover:text-amber-300 p-1"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{(t as any).bankDetailsSortCode || 'Sort Code'}:</span>
                            <span className="font-mono font-medium">60-84-64</span>
                          </div>
                          <Separator className="bg-gray-700/50" />
                          <p className="text-gray-500 text-xs italic">For international Swift transfers:</p>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">{t.bankDetailsIBAN}:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-right text-xs sm:text-sm">GB61 TRWI 6084 6462 5318 58</span>
                              <button
                                onClick={() => { navigator.clipboard.writeText('GB61TRWI60846462531858'); toast.success(t.copied); }}
                                className="text-amber-400 hover:text-amber-300 p-1"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t.bankDetailsBIC}:</span>
                            <span className="font-mono font-medium">TRWIGB2LXXX</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t.bankDetailsBank}:</span>
                            <span className="font-medium text-right text-xs">Wise Payments Limited, London, UK</span>
                          </div>
                        </>
                      ) : proforma?.bank_account === 'intesa_climatel' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t.bankDetailsHolder}:</span>
                            <span className="font-medium text-right">CLIMATEL di Elefante Pasquale Elefante</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t.bankDetailsBank}:</span>
                            <span className="font-medium text-right text-xs">Intesa Sanpaolo SPA — Via SS. Martiri, 13, Sant'Egidio del Monte Albino (SA)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">{t.bankDetailsIBAN}:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-right text-xs sm:text-sm">IT82 S030 6976 4511 0000 0003 441</span>
                              <button
                                onClick={() => { navigator.clipboard.writeText('IT82S0306976451100000003441'); toast.success(t.copied); }}
                                className="text-amber-400 hover:text-amber-300 p-1"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t.bankDetailsBIC}:</span>
                            <span className="font-mono font-medium">BCITITMMXXX</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t.bankDetailsHolder}:</span>
                            <span className="font-medium text-right">UNITA 1 di Stanislao Elefante</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t.bankDetailsBank}:</span>
                            <span className="font-medium">Intesa San Paolo</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">{t.bankDetailsIBAN}:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-right text-xs sm:text-sm">IT12P0306976451100000003224</span>
                              <button
                                onClick={() => { navigator.clipboard.writeText('IT12P0306976451100000003224'); toast.success(t.copied); }}
                                className="text-amber-400 hover:text-amber-300 p-1"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t.bankDetailsBIC}:</span>
                            <span className="font-mono font-medium">BCITITMM</span>
                          </div>
                        </>
                      )}
                      <Separator className="bg-gray-700" />
                      <div>
                        <span className="text-gray-500">{t.bankDetailsCausale}:</span>
                        <p className="text-amber-300 mt-1 font-medium">
                          {proforma.proforma_number || proforma.id}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">{t.bankDetailsCausaleValue}</p>
                      </div>
                      <div className="mt-2 text-amber-400 font-semibold text-base">
                        {t.total}: {formatPrice(currentDeposit)}
                      </div>
                      <Separator className="bg-gray-700" />
                      <div className="bg-blue-900/30 border border-blue-500/20 rounded-md p-3 flex items-start gap-2">
                        <span className="text-blue-400 text-lg mt-0.5">💡</span>
                        <p className="text-blue-300 text-xs leading-relaxed">
                          {t.bankDetailsWiseTip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs sm:text-sm py-6 sm:py-8">
          <p>Vesuviano Forni — {t.tagline}</p>
          <p className="mt-1">info@vesuvianoforni.com | +39 081 529 8484</p>
        </div>
      </div>

      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={!!zoomedImage}
        imageUrl={zoomedImage?.url || ''}
        imageAlt={zoomedImage?.alt || ''}
        onClose={() => setZoomedImage(null)}
      />
    </div>
  );
};

export default ProformaPage;
