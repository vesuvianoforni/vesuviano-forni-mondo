export const OFFER_LANGUAGES = ['it', 'en', 'fr', 'de', 'es'] as const;
export type OfferLanguage = typeof OFFER_LANGUAGES[number];
export const OFFER_CURRENCIES = ['EUR', 'GBP', 'USD', 'CHF'] as const;
export type OfferCurrency = typeof OFFER_CURRENCIES[number];
export const OFFER_STATUSES = {
  richiesta_offerta: 'Richiesta offerta', offerta_pronta: 'Offerta pronta', offerta_inviata: 'Offerta inviata',
  negoziazione: 'Negoziazione', offerta_accettata: 'Accettata', offerta_rifiutata: 'Rifiutata',
} as const;
export type OfferStatus = keyof typeof OFFER_STATUSES;
export const VAT_REGIMES = {
  standard: 'Standard · IVA 22%', reverse_charge: 'Reverse Charge · N.6.7',
  intra_ue: 'Cessione Intra UE · N.3.2', extra_ue: 'Cessione Extra UE · N.3.1',
  forfetario: 'Regime Forfetario · L. 190/2014',
} as const;
export type VatRegime = keyof typeof VAT_REGIMES;
export type CompanyEntity = 'climatel' | 'unita1' | 'wise';
export type PriceList = 'A' | 'B' | 'C' | 'Reseller';
export interface OfferCompany {
  label: string; name: string; vat: string; address: string; ownership: string;
  bank_holder: string; bank_name: string; bank_iban: string; bank_extra: string;
}
export interface OfferSettings {
  company_entity: CompanyEntity; language: OfferLanguage; currency: OfferCurrency;
  price_list: PriceList; vat_regime: VatRegime; validity_days: number;
  payment_method: 'bonifico' | 'contrassegno'; payment_agreement: string;
  include_certification: boolean; include_warranty: boolean; warranty_years: number;
  inclusions: string; exclusions: string;
  timeline_produzione: string; timeline_consegna: string; timeline_installazione: string; timeline_collaudo: string;
  signature_name: string; signature_role: string; logo_url: string;
  companies: Record<CompanyEntity, OfferCompany>;
  exclusion_presets?: { label: string; text: string }[];
}
export interface OfferItem {
  id: string; product_id: string | null; product_name: string; description: string;
  image_url: string; quantity: number; unit_price: number; discount_percent: number;
  notes: string;
}
export interface OfferDocument {
  customer_name: string; customer_contact: string; customer_email: string; customer_phone: string;
  customer_address: string; customer_vat: string; title: string; description: string;
  language: OfferLanguage; currency: OfferCurrency; price_list: PriceList; company_entity: CompanyEntity;
  vat_regime: VatRegime; valid_until: string; payment_method: 'bonifico' | 'contrassegno'; payment_agreement: string;
  include_certification: boolean; include_warranty: boolean; warranty_years: number;
  inclusions: string; exclusions: string;
  timeline_produzione: string; timeline_consegna: string; timeline_installazione: string; timeline_collaudo: string;
  items: OfferItem[]; settings_snapshot: OfferSettings;
}
export interface CommercialOffer {
  id: string; number: string; lead_id: string | null; customer_name: string; title: string;
  status: OfferStatus; document: OfferDocument; amount: number; currency: string;
  public_code: string; public_enabled: boolean; archived: boolean; created_at: string; updated_at: string;
}

// Transferred from Zapper's PublicOfferPage and CreateOfferDialog; company data is not AI generated.
export const DEFAULT_OFFER_SETTINGS: OfferSettings = {
  company_entity: 'climatel', language: 'it', currency: 'EUR', price_list: 'A', vat_regime: 'standard', validity_days: 30,
  payment_method: 'bonifico', payment_agreement: '50% acconto - 50% a consegna',
  include_certification: true, include_warranty: true, warranty_years: 1,
  inclusions: '', exclusions: '', timeline_produzione: '', timeline_consegna: '', timeline_installazione: '', timeline_collaudo: '',
  signature_name: 'Gennaro Caglione', signature_role: 'Sales & Export Manager',
  logo_url: 'https://www.vesuvianoforni.com/lovable-uploads/vesuviano-logo-bianco.png',
  exclusion_presets: [
    { label: 'Predisposizione impianti', text: "Si richiede al cliente di predisporre prima del ns. arrivo di punti di carico/scarico acqua e una presa elettrica. N.B. qualora in fase di installazione non vi è stata fatta predisposizione, l'allaccio elettrico ha un costo supplementare di 200,00 € e l'allaccio idrico ha un costo supplementare di 200,00 €." },
    { label: 'Pulizia canna fumaria', text: 'È obbligatoria la pulizia della canna fumaria prima del nostro intervento, a meno che non sia già pulita da massimo 45 giorni.' },
  ],
  companies: {
    climatel: {
      label: 'CLIMATEL · Intesa Sanpaolo', name: 'CLIMATEL di Elefante Pasquale', vat: 'IT03895390650',
      address: 'Via Galileo Ferraris, 24 - 84018 Scafati (SA) - Italy',
      ownership: 'Il Marchio di prodotti Vesuviano Forni ® è di proprietà della ditta CLIMATEL di ELEFANTE PASQUALE, via galileo ferraris 24 Scafati (SA) 84018 - Italy - P.IVA 03895390650',
      bank_holder: 'CLIMATEL DI ELEFANTE PASQUALE', bank_name: 'INTESA SANPAOLO', bank_iban: 'IT82 S030 6976 4511 0000 0003 441', bank_extra: '',
    },
    unita1: {
      label: 'UNITA 1 · Intesa Sanpaolo', name: 'UNITA 1 di Stanislao Elefante', vat: 'IT02192040661',
      address: 'VIA PIAIA, 44 - 67034 PETTORANO SUL GIZIO (AQ) - IT',
      ownership: 'Vesuviano Forni brand owned by UNITA 1 di Stanislao Elefante - P.IVA: IT02192040661 - C.F.: LFNSNS94E20G813Z - VIA PIAIA, 44 - 67034 PETTORANO SUL GIZIO (AQ) - IT - PEC: u1@pec.it',
      bank_holder: 'UNITA 1 di Stanislao Elefante', bank_name: 'INTESA SAN PAOLO BANK - BIC/SWIFT: BCITITMM', bank_iban: 'IT12P0306976451100000003224', bank_extra: '',
    },
    wise: {
      label: 'UNITA 1 · Wise UK', name: 'Unita 1 di Stanislao Elefante', vat: 'IT02192040661',
      address: 'VIA PIAIA, 44 - 67034 PETTORANO SUL GIZIO (AQ) - IT',
      ownership: 'Vesuviano Forni brand owned by UNITA 1 di Stanislao Elefante - P.IVA: IT02192040661 - C.F.: LFNSNS94E20G813Z - VIA PIAIA, 44 - 67034 PETTORANO SUL GIZIO (AQ) - IT - PEC: u1@pec.it',
      bank_holder: 'Unita 1 di Stanislao Elefante', bank_name: 'Wise Payments Limited, Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom - BIC/SWIFT: TRWIGB2LXXX',
      bank_iban: 'GB61 TRWI 6084 6462 5318 58', bank_extra: 'Account number: 62531858 — Sort code: 60-84-64',
    },
  },
};

export function newOfferDocument(settings: OfferSettings, now = new Date()): OfferDocument {
  const valid = new Date(now); valid.setDate(valid.getDate() + settings.validity_days);
  return {
    customer_name: '', customer_contact: '', customer_email: '', customer_phone: '', customer_address: '', customer_vat: '', title: '', description: '',
    language: settings.language, currency: settings.currency, price_list: settings.price_list, company_entity: settings.company_entity,
    vat_regime: settings.vat_regime, valid_until: `${valid.getFullYear()}-${String(valid.getMonth()+1).padStart(2,'0')}-${String(valid.getDate()).padStart(2,'0')}`,
    payment_method: settings.payment_method, payment_agreement: settings.payment_agreement,
    include_certification: settings.include_certification, include_warranty: settings.include_warranty, warranty_years: settings.warranty_years,
    inclusions: settings.inclusions, exclusions: settings.exclusions,
    timeline_produzione: settings.timeline_produzione, timeline_consegna: settings.timeline_consegna,
    timeline_installazione: settings.timeline_installazione, timeline_collaudo: settings.timeline_collaudo,
    items: [], settings_snapshot: structuredClone(settings),
  };
}

export const moneyRound = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
export function offerTotals(doc: Pick<OfferDocument, 'items' | 'vat_regime'>) {
  const lines = doc.items.map(item => moneyRound(item.quantity * item.unit_price * (1 - item.discount_percent / 100)));
  const subtotal = moneyRound(lines.reduce((sum, value) => sum + value, 0));
  const vat = doc.vat_regime === 'standard' ? moneyRound(subtotal * 0.22) : 0;
  return { lines, subtotal, vat, total: moneyRound(subtotal + vat) };
}
export function canManageOffers(roles: string[]) { return roles.some(role => role === 'admin' || role === 'commerciale'); }
export function canManageOfferSettings(roles: string[]) { return roles.includes('admin'); }
export function isPublicOfferAvailable(offer: Pick<CommercialOffer, 'public_enabled' | 'archived' | 'document'>, today: string) {
  return offer.public_enabled && !offer.archived && (!offer.document.valid_until || offer.document.valid_until >= today);
}
export function commercialOfferUrl(code: string) { return `https://vesuvianoforni.com/offerta/${encodeURIComponent(code)}`; }