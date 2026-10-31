import template from '../../supabase/functions/commercial-offers/template.html?raw';
import { offerTotals, type OfferDocument, type OfferLanguage } from '../../supabase/functions/commercial-offers/domain';

const labels: Record<OfferLanguage, string[]> = {
  it: ['OFFERTA N.','Data','Spett.le Cliente','Oggetto','Dettaglio Prodotti/Servizi','Totale Imponibile','IVA','Totale Offerta','Validità Offerta','Condizioni di Pagamento','Metodi di Pagamento','Coordinate Bancarie','Intestatario','Banca','Prodotto','Descrizione','Qtà','Prezzo unit.','Sconto','Totale','Incluso nella fornitura','Escluso dalla fornitura','Produzione','Consegna','Installazione','Collaudo','Certificazione di conformità','anno/i di garanzia','Bonifico bancario','Contrassegno'],
  en: ['OFFER NO.','Date','Customer','Subject','Products / Services','Subtotal','VAT','Offer Total','Offer Validity','Payment Terms','Payment Methods','Bank Details','Account holder','Bank','Product','Description','Qty','Unit price','Discount','Total','Included','Excluded','Production','Delivery','Installation','Commissioning','Certificate of conformity','year(s) warranty','Bank transfer','Cash on delivery'],
  fr: ['OFFRE N°','Date','Client','Objet','Produits / Services','Sous-total','TVA','Total de l’offre','Validité de l’offre','Conditions de paiement','Modes de paiement','Coordonnées bancaires','Titulaire','Banque','Produit','Description','Qté','Prix unit.','Remise','Total','Inclus','Exclus','Production','Livraison','Installation','Mise en service','Certificat de conformité','an(s) de garantie','Virement bancaire','Paiement à la livraison'],
  de: ['ANGEBOT NR.','Datum','Kunde','Betreff','Produkte / Leistungen','Nettobetrag','MwSt.','Angebotssumme','Gültigkeit','Zahlungsbedingungen','Zahlungsmethoden','Bankverbindung','Kontoinhaber','Bank','Produkt','Beschreibung','Menge','Einzelpreis','Rabatt','Gesamt','Enthalten','Nicht enthalten','Produktion','Lieferung','Installation','Inbetriebnahme','Konformitätsbescheinigung','Jahr(e) Garantie','Banküberweisung','Nachnahme'],
  es: ['OFERTA N.º','Fecha','Cliente','Asunto','Productos / Servicios','Subtotal','IVA','Total de la oferta','Validez de la oferta','Condiciones de pago','Métodos de pago','Datos bancarios','Titular','Banco','Producto','Descripción','Cant.','Precio unit.','Descuento','Total','Incluido','Excluido','Producción','Entrega','Instalación','Puesta en marcha','Certificado de conformidad','año(s) de garantía','Transferencia bancaria','Contra reembolso'],
};
const locales = { it: 'it-IT', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', es: 'es-ES' };
export const escapeOfferHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));
const lines = (value: string) => escapeOfferHtml(value).replace(/\n/g,'<br>');
export function renderCommercialOffer(doc: OfferDocument, number = 'BOZZA', createdAt = new Date().toISOString()) {
  const l = labels[doc.language] ?? labels.it;
  const locale = locales[doc.language] ?? locales.it;
  const totals = offerTotals(doc);
  const money = (value: number) => new Intl.NumberFormat(locale,{minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
  const date = (value: string) => new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString(locale);
  const settings = doc.settings_snapshot;
  const company = settings.companies[doc.company_entity];
  const symbol = {EUR:'€',GBP:'£',USD:'$',CHF:'CHF'}[doc.currency];
  const rows = doc.items.map((item,index) => `<tr><td><strong>${escapeOfferHtml(item.product_name)}</strong></td><td>${lines(item.description)}${item.notes ? `<br><small>${lines(item.notes)}</small>` : ''}</td><td>${item.quantity}</td><td>${money(item.unit_price)}</td><td>${item.discount_percent}%</td><td>${money(totals.lines[index] ?? 0)}</td></tr>`).join('');
  const table = `<div class="table-wrapper"><table><thead><tr>${l.slice(14,20).map(label => `<th>${label}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
  const timeline = [doc.timeline_produzione,doc.timeline_consegna,doc.timeline_installazione,doc.timeline_collaudo].map((value,index) => value ? `<div class="info-item"><div class="info-label">${l[22+index]}</div><div>${lines(value)}</div></div>` : '').join('');
  const included = [doc.include_certification ? l[26] : '', doc.include_warranty ? `${doc.warranty_years} ${l[27]}` : '', doc.inclusions].filter(Boolean).join('\n');
  const section = (title: string, text: string) => text ? `<div class="section"><div class="section-title">${title}</div><div class="client-info">${lines(text)}</div></div>` : '';
  let html = template;
  // Translate only static labels before substituting escaped user content.
  const original = labels.it;
  const staticMap = [[0,'OFFERTA N.'],[1,'Data:'],[2,'Spett.le Cliente'],[3,'Oggetto'],[4,'Dettaglio Prodotti/Servizi'],[5,'Totale Imponibile:'],[6,'IVA:'],[7,'Totale Offerta:'],[8,'Validità Offerta'],[9,'Condizioni di Pagamento'],[10,'Metodi di Pagamento'],[11,'Coordinate Bancarie'],[12,'Intestatario:'],[13,'Banca:']] as const;
  if (doc.language !== 'it') for (const [index,text] of staticMap) html = html.replace(text, (l[index] ?? original[index]) + (text.endsWith(':') ? ':' : ''));
  const terms = doc.payment_agreement === '50% acconto - 50% a consegna' ? ({it:doc.payment_agreement,en:'50% deposit - 50% on delivery',fr:'50% d’acompte - 50% à la livraison',de:'50% Anzahlung - 50% bei Lieferung',es:'50% de anticipo - 50% a la entrega'}[doc.language]) : doc.payment_agreement;
  const values: Record<string,string> = {
    language: doc.language, logo_url: escapeOfferHtml(settings.logo_url), currency_symbol: symbol,
    numero_offerta: escapeOfferHtml(number), data_offerta: date(createdAt), brand_ownership_text: escapeOfferHtml(company?.ownership ?? ''),
    cliente_nome: escapeOfferHtml(doc.customer_name), cliente_indirizzo: lines(doc.customer_address), cliente_contatto: escapeOfferHtml(doc.customer_contact),
    cliente_email: escapeOfferHtml(doc.customer_email), cliente_telefono: escapeOfferHtml(doc.customer_phone), cliente_piva: escapeOfferHtml(doc.customer_vat),
    oggetto_offerta: escapeOfferHtml(doc.title), descrizione: lines(doc.description), tabella_prodotti: table,
    totale_imponibile: money(totals.subtotal), totale_iva: money(totals.vat) + (doc.vat_regime !== 'standard' ? `<br><small>${escapeOfferHtml(doc.vat_regime === 'reverse_charge' ? 'N.6.7' : doc.vat_regime === 'intra_ue' ? 'N.3.2' : doc.vat_regime === 'extra_ue' ? 'N.3.1' : 'L. 190/2014')}</small>` : ''),
    totale_lordo: money(totals.total), validita_offerta: doc.valid_until ? date(doc.valid_until) : '—', timeline_section: timeline,
    inclusions_section: section(l[20], included), exclusions_section: section(l[21], doc.exclusions),
    metodi_pagamento: lines(`${doc.payment_method === 'bonifico' ? l[28] : l[29]}\n${terms}`),
    bank_holder: escapeOfferHtml(company?.bank_holder), bank_name: escapeOfferHtml(company?.bank_name), bank_iban: escapeOfferHtml(company?.bank_iban), bank_extra: escapeOfferHtml(company?.bank_extra),
    firma_commerciale: `${escapeOfferHtml(settings.signature_name)}<br>${escapeOfferHtml(settings.signature_role)}`,
  };
  return html.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => values[key] ?? '');
}