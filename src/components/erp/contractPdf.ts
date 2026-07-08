import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import firmaStanislaoAsset from '@/assets/firma-stanislao-elefante.png.asset.json';

export type ContractLanguage = 'it' | 'en' | 'fr' | 'de' | 'es';

const UI_LABELS: Record<ContractLanguage, Record<string, string>> = {
  it: {
    title: 'CONDIZIONI GENERALI DI VENDITA',
    date: 'Data',
    offerRef: 'Rif. Offerta',
    client: 'Cliente',
    page: 'Pagina',
    of: 'di',
    footer: 'vesuvianoforni.com  ·  Condizioni Generali di Vendita',
    placeDate: 'Luogo e data:',
    clientLabel: 'Cliente:',
    accept: 'Il Cliente dichiara di aver letto, compreso e accettato integralmente le presenti Condizioni Generali di Vendita.',
    clientSig: 'Firma del Cliente',
    supplier: 'Vesuviano Forni — UNITA 1 di Stanislao Elefante',
    supplierRole: 'Il Fornitore',
    stampSign: '(timbro e firma per accettazione)',
    signedOn: 'Firmato digitalmente il',
    approval: 'Ai sensi e per gli effetti degli artt. 1341 e 1342 c.c., il Cliente dichiara di approvare specificamente le clausole di cui ai punti: 3, 4, 6, 7, 8, 10, 11, 12, 13, 14, 16, 17, 18.',
    approvalSig: 'Firma del Cliente per approvazione specifica',
    section20: '20. Accettazione delle Condizioni Generali di Vendita',
  },
  en: {
    title: 'GENERAL CONDITIONS OF SALE',
    date: 'Date',
    offerRef: 'Offer ref.',
    client: 'Client',
    page: 'Page',
    of: 'of',
    footer: 'vesuvianoforni.com  ·  General Conditions of Sale',
    placeDate: 'Place and date:',
    clientLabel: 'Client:',
    accept: 'The Client declares to have read, understood and fully accepted these General Conditions of Sale.',
    clientSig: "Client's signature",
    supplier: 'Vesuviano Forni — UNITA 1 di Stanislao Elefante',
    supplierRole: 'The Supplier',
    stampSign: '(stamp and signature for acceptance)',
    signedOn: 'Digitally signed on',
    approval: 'Pursuant to Articles 1341 and 1342 of the Italian Civil Code, the Client specifically approves the clauses set out in sections: 3, 4, 6, 7, 8, 10, 11, 12, 13, 14, 16, 17, 18.',
    approvalSig: "Client's signature for specific approval",
    section20: '20. Acceptance of the General Conditions of Sale',
  },
  fr: {
    title: 'CONDITIONS GÉNÉRALES DE VENTE',
    date: 'Date',
    offerRef: 'Réf. offre',
    client: 'Client',
    page: 'Page',
    of: 'sur',
    footer: 'vesuvianoforni.com  ·  Conditions Générales de Vente',
    placeDate: 'Lieu et date :',
    clientLabel: 'Client :',
    accept: "Le Client déclare avoir lu, compris et accepté intégralement les présentes Conditions Générales de Vente.",
    clientSig: 'Signature du Client',
    supplier: 'Vesuviano Forni — UNITA 1 di Stanislao Elefante',
    supplierRole: 'Le Fournisseur',
    stampSign: "(cachet et signature pour acceptation)",
    signedOn: 'Signé numériquement le',
    approval: "Conformément aux articles 1341 et 1342 du Code civil italien, le Client approuve spécifiquement les clauses figurant aux points : 3, 4, 6, 7, 8, 10, 11, 12, 13, 14, 16, 17, 18.",
    approvalSig: 'Signature du Client pour approbation spécifique',
    section20: '20. Acceptation des Conditions Générales de Vente',
  },
  de: {
    title: 'ALLGEMEINE VERKAUFSBEDINGUNGEN',
    date: 'Datum',
    offerRef: 'Angebots-Nr.',
    client: 'Kunde',
    page: 'Seite',
    of: 'von',
    footer: 'vesuvianoforni.com  ·  Allgemeine Verkaufsbedingungen',
    placeDate: 'Ort und Datum:',
    clientLabel: 'Kunde:',
    accept: 'Der Kunde erklärt, die vorliegenden Allgemeinen Verkaufsbedingungen gelesen, verstanden und vollständig akzeptiert zu haben.',
    clientSig: 'Unterschrift des Kunden',
    supplier: 'Vesuviano Forni — UNITA 1 di Stanislao Elefante',
    supplierRole: 'Der Lieferant',
    stampSign: '(Stempel und Unterschrift zur Annahme)',
    signedOn: 'Digital unterzeichnet am',
    approval: 'Gemäß Art. 1341 und 1342 des italienischen Zivilgesetzbuchs genehmigt der Kunde ausdrücklich die Klauseln der Ziffern: 3, 4, 6, 7, 8, 10, 11, 12, 13, 14, 16, 17, 18.',
    approvalSig: 'Unterschrift des Kunden zur ausdrücklichen Genehmigung',
    section20: '20. Annahme der Allgemeinen Verkaufsbedingungen',
  },
  es: {
    title: 'CONDICIONES GENERALES DE VENTA',
    date: 'Fecha',
    offerRef: 'Ref. oferta',
    client: 'Cliente',
    page: 'Página',
    of: 'de',
    footer: 'vesuvianoforni.com  ·  Condiciones Generales de Venta',
    placeDate: 'Lugar y fecha:',
    clientLabel: 'Cliente:',
    accept: 'El Cliente declara haber leído, comprendido y aceptado íntegramente las presentes Condiciones Generales de Venta.',
    clientSig: 'Firma del Cliente',
    supplier: 'Vesuviano Forni — UNITA 1 di Stanislao Elefante',
    supplierRole: 'El Proveedor',
    stampSign: '(sello y firma para aceptación)',
    signedOn: 'Firmado digitalmente el',
    approval: 'De conformidad con los arts. 1341 y 1342 del Código Civil italiano, el Cliente aprueba específicamente las cláusulas indicadas en los puntos: 3, 4, 6, 7, 8, 10, 11, 12, 13, 14, 16, 17, 18.',
    approvalSig: 'Firma del Cliente para aprobación específica',
    section20: '20. Aceptación de las Condiciones Generales de Venta',
  },
};

const LOCALE_BY_LANG: Record<ContractLanguage, string> = { it: 'it-IT', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', es: 'es-ES' };

async function translateSections(
  sections: { title: string; body: string }[],
  targetLanguage: ContractLanguage,
): Promise<{ title: string; body: string }[]> {
  if (targetLanguage === 'it') return sections;
  try {
    const { data, error } = await supabase.functions.invoke('contract-ai-assist', {
      body: { action: 'translate', target_language: targetLanguage, sections },
    });
    if (error) throw error;
    const out = (data as any)?.sections;
    if (Array.isArray(out) && out.length === sections.length) return out;
    return sections;
  } catch (e) {
    console.warn('[contractPdf] translation failed, falling back to IT', e);
    return sections;
  }
}



export interface ContractClause {
  title: string;
  content: string;
}

export interface ContractVariableFields {
  offer_number?: string;
  offer_date?: string;
  client_name?: string;
  destination?: string;
  payment_agreements?: string;
  refund_days?: string;
  work_time?: string;
  production_time?: string;
  delivery_estimate?: string;
  ready_date?: string;
  ship_date?: string;
  balance_due_days?: string;
  storage_cost?: string;
  shipping_method?: string;
  carrier?: string;
  shipping_included?: string;
  insurance_included?: string;
  delivery_responsibility?: string;
  incoterms?: string;
  unloading_included?: string;
  internal_handling_included?: string;
  unloading_means?: string;
  unloading_responsible?: string;
  handling_responsible?: string;
  logistics_notes?: string;
  assembly_included?: string;
  installation_included?: string;
  startup_included?: string;
  training_included?: string;
  chimney_responsible?: string;
  gas_responsible?: string;
  electric_responsible?: string;
  masonry_responsible?: string;
  permits_responsible?: string;
  dim_tolerance?: string;
  color_tolerance?: string;
  weight_tolerance?: string;
  warranty_duration?: string;
  warranty_coverage?: string;
  warranty_exclusions?: string;
  place_signed?: string;
  production_days?: string;
  shipping_days?: string;
  bank_details?: string;
}


export interface ContractData {
  id?: string;
  client_name: string;
  client_email?: string | null;
  client_address?: string | null;
  client_vat?: string | null;
  offer_number?: string | null;
  offer_date?: string | null;
  destination?: string | null;
  place_signed?: string | null;
  total_amount: number;
  currency: string;
  payment_terms: string;
  warranty_years: number;
  clauses?: ContractClause[];
  variable_fields?: ContractVariableFields;
  created_at?: string;
  client_signature?: string | null;
  client_signed_at?: string | null;
  language?: ContractLanguage;
}


const COMPANY = {
  brand: 'VESUVIANO FORNI',
  legal: 'brand owned by UNITA 1 di Stanislao Elefante',
  vat: 'P.IVA: IT02192040661',
  cf: 'C.F.: LFNSNS94E20G813Z',
  address: 'VIA PIAIA, 44 – 67034 PETTORANO SUL GIZIO (AQ) – IT',
  pec: 'PEC: u1@pec.it',
};

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function loadLogo(): Promise<string | null> {
  return loadImageAsDataUrl('/lovable-uploads/vesuviano-logo-bianco.png');
}

async function loadSupplierSignature(): Promise<string | null> {
  return loadImageAsDataUrl(firmaStanislaoAsset.url);
}


const V = (v?: string | null) => (v && String(v).trim() ? String(v).trim() : '_______________');

function buildSections(data: ContractData): { title: string; body: string }[] {
  const vf = data.variable_fields || {};
  const amountFmt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: data.currency || 'EUR' }).format(data.total_amount || 0);
  const paymentAgreements = vf.payment_agreements || data.payment_terms ||
    `50% di acconto alla conferma dell'ordine, 50% a saldo a merce pronta per la spedizione previo invio di supporto fotografico. Importo complessivo: ${amountFmt}.`;
  const warrantyDuration = vf.warranty_duration || `${data.warranty_years} ${data.warranty_years === 1 ? 'anno' : 'anni'}`;

  return [
    {
      title: 'Premessa',
      body:
`Le presenti Condizioni Generali di Vendita disciplinano la vendita dei prodotti commercializzati con il brand Vesuviano Forni, brand owned by UNITA 1 di Stanislao Elefante, P.IVA IT02192040661, C.F. LFNSNS94E20G813Z, con sede in Via Piaia, 44 – 67034 Pettorano sul Gizio (AQ) – Italia, PEC u1@pec.it.

Le presenti Condizioni Generali di Vendita si riferiscono all'offerta/preventivo n. ${V(vf.offer_number || data.offer_number)}.

L'accettazione dell'offerta, della conferma d'ordine, della fattura proforma, del contratto oppure il pagamento dell'acconto comportano l'integrale accettazione delle presenti Condizioni Generali di Vendita.`,
    },
    {
      title: '1. Riferimento offerta',
      body:
`Offerta / preventivo n.: ${V(vf.offer_number || data.offer_number)}
Data offerta: ${V(vf.offer_date || data.offer_date)}
Cliente: ${V(vf.client_name || data.client_name)}
Destinazione merce: ${V(vf.destination || data.destination)}

Le caratteristiche dei prodotti, dei servizi inclusi, degli accessori, delle condizioni economiche e delle condizioni particolari applicabili sono quelle indicate nell'offerta/preventivo n. ${V(vf.offer_number || data.offer_number)}, che costituisce parte integrante delle presenti Condizioni Generali di Vendita.

In caso di contrasto tra l'offerta/preventivo e le presenti Condizioni Generali, prevalgono le condizioni particolari indicate nell'offerta/preventivo, limitatamente agli aspetti espressamente disciplinati.`,
    },
    {
      title: "2. Accettazione dell'offerta e avvio lavori",
      body:
`L'ordine si intende confermato a seguito di accettazione scritta dell'offerta da parte del Cliente e/o pagamento dell'acconto previsto.

L'acconto è richiesto per l'avvio dei lavori di costruzione, progettazione, approvvigionamento materiali, personalizzazione e organizzazione della commessa.

Vesuviano Forni avvierà le attività di lavorazione e costruzione solo dopo la ricezione dell'acconto, salvo diverso accordo scritto.

Vesuviano Forni si riserva il diritto di accettare o rifiutare l'ordine qualora emergano impedimenti tecnici, produttivi, logistici, normativi o commerciali.`,
    },
    {
      title: '3. Accordi di pagamento',
      body:
`Gli accordi di pagamento sono i seguenti:

${paymentAgreements}
${vf.bank_details ? `\nCoordinate bancarie per bonifico:\n${vf.bank_details}\n` : ''}
Salvo diverso accordo scritto, la spedizione, il ritiro o la consegna del prodotto avverranno solo dopo l'integrale pagamento del prezzo pattuito.

La comunicazione di "merce pronta", "forno pronto" o "prodotto pronto per la spedizione" comporta l'obbligo del Cliente di procedere al pagamento del saldo secondo gli accordi indicati.

Eventuali contestazioni non autorizzano il Cliente a sospendere, ritardare o compensare i pagamenti dovuti, salvo contestazioni gravi, documentate e direttamente imputabili a Vesuviano Forni.

In caso di ritardo nei pagamenti, Vesuviano Forni potrà sospendere produzione, consegna, spedizione, montaggio o assistenza, con addebito al Cliente degli eventuali costi aggiuntivi sostenuti.`,
    },
    {
      title: '4. Acconto e condizioni di rimborso',
      body:
`Salvo diverso accordo scritto, l'ordine prevede il pagamento di un acconto nella misura indicata nell'offerta/preventivo, nella conferma d'ordine o nella fattura proforma.

L'acconto è richiesto per l'avvio dei lavori di costruzione, la prenotazione della produzione, l'acquisto dei materiali, la progettazione, la personalizzazione e l'organizzazione della commessa.

Il Cliente potrà richiedere l'annullamento dell'ordine e il rimborso integrale dell'acconto esclusivamente mediante comunicazione scritta inviata a Vesuviano Forni entro e non oltre 2 giorni lavorativi dalla data dell'ordine.

Decorso tale termine e comunque entro e non oltre 30 giorni dalla data dell'ordine, l'acconto sarà rimborsabile esclusivamente nella misura del 50% dell'importo versato. Il restante 50% dell'acconto sarà trattenuto da Vesuviano Forni a titolo di ammenda, indennità e compensazione per la precedente messa in lavorazione dell'ordine e le attività già avviate.

Decorso il termine di 30 giorni dalla data dell'ordine, l'acconto non sarà rimborsabile, salvo diversa valutazione discrezionale di Vesuviano Forni.

Qualora, al momento della richiesta di annullamento, la produzione sia già in fase avanzata, il prodotto sia stato personalizzato, siano stati acquistati materiali specifici o siano stati sostenuti costi superiori al 50% dell'acconto, Vesuviano Forni si riserva il diritto di trattenere ulteriori importi, nei limiti dei costi effettivamente sostenuti e del danno subito.

Eventuali rimborsi saranno effettuati entro ${V(vf.refund_days)} giorni lavorativi dall'accettazione della richiesta, salvo diverso accordo scritto.`,
    },
    {
      title: '5. Prodotti su ordine e personalizzati',
      body:
`I forni e i prodotti Vesuviano Forni possono essere realizzati su ordine e/o secondo specifiche esigenze del Cliente, quali diametro, alimentazione, colore, finitura, mosaico, configurazione tecnica, accessori, logo, misure, componenti, materiali o modalità di spedizione.

Per i prodotti realizzati su misura, su ordine o chiaramente personalizzati, il diritto di recesso è escluso nei limiti consentiti dalla normativa applicabile.

Eventuali modifiche richieste dopo la conferma dell'ordine potranno essere accettate solo previa valutazione tecnica e commerciale di Vesuviano Forni e potranno comportare costi aggiuntivi e variazioni dei tempi di lavorazione, produzione e consegna.`,
    },
    {
      title: '6. Tempi di lavorazione, produzione e consegna',
      body:
`Tempi di lavorazione: ${V(vf.work_time)}
Tempi di produzione: ${V(vf.production_time)}
Tempi di consegna stimati: ${V(vf.delivery_estimate)}
Data indicativa di merce pronta: ${V(vf.ready_date)}
Data indicativa di spedizione/consegna: ${V(vf.ship_date)}

I tempi indicati decorrono dal momento in cui Vesuviano Forni ha ricevuto l'acconto, i dati tecnici necessari, la conferma definitiva delle specifiche, i dati fiscali/logistici e gli eventuali documenti richiesti.

Salvo diversa indicazione scritta, i tempi comunicati sono stimati e non essenziali.

Eventuali ritardi dovuti a cause non imputabili a Vesuviano Forni, inclusi ritardi di fornitori, trasportatori, dogane, festività, scioperi, forza maggiore, indisponibilità del Cliente, informazioni incomplete, mancato pagamento del saldo o locali non pronti, non danno diritto all'annullamento dell'ordine, a penali o a risarcimenti.`,
    },
    {
      title: '7. Merce pronta, mancato saldo e deposito',
      body:
`Quando il prodotto è pronto per la spedizione o il ritiro, Vesuviano Forni ne darà comunicazione al Cliente.

Termine pagamento saldo da comunicazione merce pronta: ${V(vf.balance_due_days)}

In caso di mancato pagamento del saldo, mancato ritiro, rinvio della consegna o impossibilità di spedizione per cause imputabili al Cliente, Vesuviano Forni potrà trattenere il prodotto in deposito, anche presso terzi, con costi a carico del Cliente.

Costo deposito: ${V(vf.storage_cost)}

Salvo diverso accordo scritto, i costi di deposito potranno essere addebitati in misura pari all'1,5% del prezzo del prodotto per ogni mese o frazione di mese, oltre a eventuali costi di movimentazione, assicurazione, giacenza, nuova spedizione o riorganizzazione logistica.

Se il ritardo del Cliente supera 90 giorni dalla comunicazione di merce pronta, Vesuviano Forni potrà risolvere il contratto, trattenere le somme già versate e richiedere il risarcimento di eventuali ulteriori danni.`,
    },
    {
      title: '8. Spedizione, assicurazione e responsabilità del trasporto',
      body:
`Modalità di spedizione: ${V(vf.shipping_method)}
Corriere / vettore / spedizioniere: ${V(vf.carrier)}
Trasporto incluso nel prezzo: ${V(vf.shipping_included)}
Assicurazione trasporto inclusa: ${V(vf.insurance_included)}
Responsabilità della consegna: ${V(vf.delivery_responsibility)}
Incoterms / resa, se applicabile: ${V(vf.incoterms)}

Salvo diverso accordo scritto, la spedizione viene effettuata tramite corriere, vettore o spedizioniere incaricato per il trasporto di merce pesante, fragile o voluminosa.

La merce viaggia con copertura assicurativa nei limiti e alle condizioni previste dal vettore, dallo spedizioniere o dalla polizza di trasporto applicabile.

Dal momento dell'affidamento della merce al corriere, eventuali danni, ritardi, smarrimenti, furti, manomissioni o problematiche direttamente imputabili al trasporto saranno gestiti nei confronti del corriere, vettore, spedizioniere o compagnia assicurativa competente, fermo restando l'obbligo di collaborazione di Vesuviano Forni nella gestione della pratica.

Per le vendite a Clienti professionali, salvo diversa indicazione scritta, il rischio del trasporto passa al Cliente al momento dell'affidamento della merce al vettore, corriere o spedizioniere. Per le vendite a consumatori restano salve le disposizioni inderogabili previste dalla normativa applicabile.`,
    },
    {
      title: '9. Controllo merce alla consegna',
      body:
`Il Cliente è tenuto a verificare attentamente la merce al momento della consegna.

In caso di imballo danneggiato, merce danneggiata, colli mancanti, anomalie visibili o sospette, il Cliente dovrà:
1) accettare la merce esclusivamente con riserva scritta specifica sul documento di trasporto;
2) fotografare imballo, merce, etichette e documento di trasporto;
3) comunicare tempestivamente l'accaduto a Vesuviano Forni, inviando foto e documentazione.

La dicitura generica "con riserva" potrebbe non essere sufficiente ai fini assicurativi. È necessario indicare una riserva specifica, ad esempio: "imballo danneggiato", "collo aperto", "merce scheggiata", "merce bagnata", "bancale rotto" o "colli mancanti".

In mancanza di riserva specifica al momento della consegna, la gestione del reclamo assicurativo potrebbe essere limitata, respinta o resa impossibile dal corriere, vettore, spedizioniere o compagnia assicurativa.`,
    },
    {
      title: '10. Scarico, movimentazione e accessibilità',
      body:
`Scarico incluso: ${V(vf.unloading_included)}
Movimentazione interna inclusa: ${V(vf.internal_handling_included)}
Mezzi necessari allo scarico: ${V(vf.unloading_means)}
Responsabile dello scarico: ${V(vf.unloading_responsible)}
Responsabile movimentazione interna: ${V(vf.handling_responsible)}
Note logistiche: ${V(vf.logistics_notes)}

Salvo diverso accordo scritto, scarico dal mezzo, movimentazione interna, muletto, gru, transpallet, sollevatori, personale di supporto e ogni altra attività logistica presso il luogo di consegna sono a carico esclusivo del Cliente.

Il Cliente è responsabile di verificare preventivamente accessibilità del mezzo, area di scarico, dimensioni di porte, scale, corridoi, ascensori e passaggi, portata di pavimenti, necessità di mezzi speciali, permessi e idoneità del luogo di installazione.

Vesuviano Forni non risponde di ritardi, costi aggiuntivi, danni, impossibilità di consegna o impossibilità di installazione derivanti da informazioni logistiche incomplete, errate o non comunicate dal Cliente.`,
    },
    {
      title: '11. Installazione, canne fumarie, allacci e predisposizioni',
      body:
`Montaggio incluso: ${V(vf.assembly_included)}
Installazione inclusa: ${V(vf.installation_included)}
Primo avviamento incluso: ${V(vf.startup_included)}
Formazione uso inclusa: ${V(vf.training_included)}
Responsabile canna fumaria: ${V(vf.chimney_responsible)}
Responsabile allaccio gas: ${V(vf.gas_responsible)}
Responsabile allaccio elettrico: ${V(vf.electric_responsible)}
Responsabile opere murarie: ${V(vf.masonry_responsible)}
Responsabile permessi/autorizzazioni: ${V(vf.permits_responsible)}

Salvo diverso accordo scritto, sono a carico esclusivo del Cliente tutte le opere preparatorie, tecniche e accessorie necessarie all'installazione e al funzionamento del prodotto, incluse opere murarie, basamenti, canne fumarie, condotti di aspirazione e scarico fumi, prese d'aria, allacci gas, elettrici, idrici, messa a terra, certificazioni, pratiche comunali, sanitarie, ambientali o antincendio e autorizzazioni richieste nel Paese di installazione.

Il Cliente è responsabile della conformità del locale, degli impianti e delle predisposizioni alla normativa applicabile nel luogo di installazione.

Gli eventuali tecnici incaricati da Vesuviano Forni sono abilitati esclusivamente al montaggio o all'assistenza sui componenti forniti da Vesuviano Forni, salvo diverso accordo scritto.

Restano esclusi, salvo espressa previsione contrattuale, collaudi normativi, certificazioni di impianti terzi, verifica della canna fumaria, verifica degli allacci gas/elettrici/idrici e ogni controllo su opere non fornite da Vesuviano Forni.`,
    },
    {
      title: '12. Tolleranze artigianali e modifiche tecniche',
      body:
`I prodotti Vesuviano Forni sono realizzati con processi artigianali e tecnici. Misure, pesi, colori, finiture, mosaici, texture e dettagli estetici possono presentare tolleranze rispetto a immagini, rendering, fotografie o descrizioni commerciali.

Tolleranza dimensionale ammessa: ${V(vf.dim_tolerance)}
Tolleranza colore/finitura ammessa: ${V(vf.color_tolerance)}
Tolleranza peso ammessa: ${V(vf.weight_tolerance)}

Vesuviano Forni si riserva il diritto di apportare modifiche tecniche, estetiche o costruttive che non alterino in modo sostanziale funzionalità e prestazioni del prodotto.`,
    },
    {
      title: '13. Garanzia',
      body:
`Durata della garanzia: ${warrantyDuration}
Decorrenza della garanzia: dal giorno del pagamento dell'acconto
Copertura della garanzia: ${V(vf.warranty_coverage)}
Esclusioni particolari: ${V(vf.warranty_exclusions)}

La garanzia decorre dal giorno del pagamento dell'acconto da parte del Cliente, in quanto da tale momento Vesuviano Forni avvia lavorazione, costruzione, progettazione, approvvigionamento materiali e organizzazione della commessa.

La garanzia copre esclusivamente eventuali difetti di fabbricazione dei componenti forniti da Vesuviano Forni, nei limiti indicati nell'offerta/preventivo e nelle presenti Condizioni Generali di Vendita.

La garanzia consiste, a discrezione di Vesuviano Forni, nella riparazione o sostituzione del componente riconosciuto difettoso.

Salvo diverso accordo scritto, sono esclusi dalla garanzia: manodopera, trasferta, spedizione ricambi, materiali di consumo, normale usura, uso improprio, shock termici, mancato o errato curing/primo riscaldamento, cattiva manutenzione, manomissioni, modifiche non autorizzate, installazione non conforme, errato tiraggio della canna fumaria, problemi da allacci gas/elettrici/idrici, alimentazione elettrica irregolare, combustibile non idoneo e uso non conforme alle istruzioni.

La sostituzione o riparazione di un componente non comporta rinnovo o prolungamento della garanzia originaria.

Per i consumatori restano salvi i diritti inderogabili previsti dalla normativa applicabile.`,
    },
    {
      title: '14. Esclusione di garanzia sul risultato produttivo',
      body:
`Vesuviano Forni non garantisce uno specifico risultato produttivo, qualitativo, commerciale o gastronomico derivante dall'utilizzo del forno.

La qualità del prodotto cotto dipende anche da fattori esterni, quali abilità dell'operatore, impasto, ingredienti, idratazione, ricette, temperatura di esercizio, gestione del fuoco o del bruciatore, manutenzione, ambiente di installazione, canna fumaria, tiraggio e modalità operative del Cliente.`,
    },
    {
      title: '15. Obblighi del Cliente',
      body:
`Il Cliente si impegna a fornire dati tecnici, logistici e fiscali corretti, confermare tempestivamente le specifiche, predisporre il locale prima della consegna o del montaggio, ottenere permessi e autorizzazioni, verificare l'idoneità degli impianti e degli allacci, rispettare le istruzioni d'uso e manutenzione, non modificare il prodotto senza autorizzazione scritta e pagare il prezzo nei termini concordati.

Il mancato rispetto di tali obblighi potrà comportare la sospensione della produzione, consegna, montaggio, garanzia o assistenza.`,
    },
    {
      title: '16. Riserva di proprietà',
      body:
`La proprietà del prodotto resta in capo a Vesuviano Forni fino all'integrale pagamento del prezzo, incluse eventuali spese di trasporto, montaggio, accessori, deposito, interessi o costi aggiuntivi.

Fino al completo pagamento, il Cliente non potrà vendere, cedere, modificare, trasferire o costituire diritti di terzi sul prodotto senza autorizzazione scritta di Vesuviano Forni.`,
    },
    {
      title: '17. Forza maggiore',
      body:
`Vesuviano Forni non sarà responsabile per ritardi, sospensioni o impossibilità di esecuzione dovuti a cause di forza maggiore o comunque non imputabili, inclusi eventi naturali, incendi, scioperi, blocchi dei trasporti, ritardi dei fornitori, guerre, pandemie, provvedimenti delle autorità, interruzioni energetiche, dogane, indisponibilità di materiali o componenti.`,
    },
    {
      title: '18. Legge applicabile e foro competente',
      body:
`Le presenti Condizioni Generali di Vendita sono regolate dalla legge italiana.

Per le controversie con Clienti professionali, salvo diverso accordo scritto, sarà competente in via esclusiva il Tribunale di Nocera Inferiore (SA).

Per le controversie con consumatori, si applica il foro inderogabile previsto dalla normativa vigente.`,
    },
    {
      title: '19. Disposizioni finali',
      body:
`Eventuali deroghe alle presenti Condizioni Generali di Vendita saranno valide solo se concordate per iscritto.

L'eventuale invalidità o inefficacia di una clausola non comporterà l'invalidità delle restanti condizioni.

La versione applicabile al singolo ordine sarà quella accettata dal Cliente al momento della conferma dell'ordine o del pagamento dell'acconto.`,
    },
  ];
}

export function isPietraCalda(data: ContractData): boolean {
  const name = (data.client_name || '').toLowerCase();
  return (
    name.includes('pietra calda') ||
    name.includes("l'arche") ||
    name.includes('l arche') ||
    name.includes('larche')
  );
}

export function buildOrderConfirmationSections(
  data: ContractData,
  lang: ContractLanguage = 'fr',
): { title: string; body: string }[] {
  const vf = data.variable_fields || {};
  const locale = LOCALE_BY_LANG[lang] || 'fr-FR';
  const amountFmt = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: data.currency || 'EUR',
  }).format(data.total_amount || 0);
  const productionDays = vf.production_days || '30';
  const shippingDays = vf.shipping_days || '15';

  if (lang === 'it') {
    return [
      {
        title: "1. Oggetto dell'ordine",
        body:
`La presente conferma riguarda la fornitura di un forno Vesuviano Forni, secondo l'offerta aggiornata e la fattura proforma trasmesse al cliente.

Destinazione della merce: Francia.`,
      },
      {
        title: '2. Prezzo finale e condizioni commerciali',
        body:
`Il prezzo finale validato eccezionalmente è di:

${amountFmt} consegna inclusa, secondo l'offerta aggiornata e la fattura proforma.

Questo prezzo è validato in via eccezionale, a condizione che l'ordine venga confermato e l'acconto pagato entro il 10/07/2026.`,
      },
      {
        title: '3. Condizioni di pagamento',
        body:
`Le condizioni di pagamento sono le seguenti:

• 50% di acconto alla conferma dell'ordine;
• 50% di saldo quando il forno sarà pronto per la spedizione, prima dell'invio della merce.

Le coordinate bancarie saranno indicate nella fattura proforma.`,
      },
      {
        title: '4. Tempi di produzione e consegna',
        body:
`I tempi stimati sono i seguenti:

• Tempo di produzione / fabbricazione: circa ${productionDays} giorni dalla ricezione dell'acconto e dalla conferma completa delle informazioni tecniche, fiscali e logistiche;
• Tempo di trasporto stimato: circa ${shippingDays} giorni, secondo l'organizzazione logistica e la disponibilità del trasportatore.

I tempi sono indicativi e possono variare in funzione della produzione artigianale, della disponibilità dei materiali, del trasportatore o di cause indipendenti da Vesuviano Forni.`,
      },
      {
        title: '5. Consegna e monitoraggio logistico',
        body:
`La consegna è inclusa nel prezzo, secondo le condizioni indicate nell'offerta e nella fattura proforma.

Vesuviano Forni si impegna ad assicurare un monitoraggio serio della consegna, in coordinamento con il trasportatore / partner logistico incaricato della spedizione.

Il cliente sarà informato sull'avanzamento dell'ordine, della produzione e della spedizione.

Lo scarico, la movimentazione interna, i mezzi di sollevamento, il muletto o qualsiasi altro mezzo necessario sul luogo di consegna restano a carico del cliente, salvo diverso accordo scritto.`,
      },
      {
        title: '6. Servizio post-vendita e assistenza',
        body:
`Vesuviano Forni si impegna a restare disponibile dopo la consegna per accompagnare il cliente nello sviluppo del progetto.

Il servizio post-vendita comprende:
• assistenza tecnica a distanza;
• supporto in caso di problematiche relative al prodotto fornito;
• disponibilità per diagnosi tecnica;
• eventuale fornitura di pezzi di ricambio, se necessario;
• accompagnamento nelle prime fasi di utilizzo, secondo le necessità del cliente.

Vesuviano Forni si impegna a gestire le richieste post-vendita in modo reattivo e professionale.`,
      },
      {
        title: '7. Componenti di ricambio inclusi',
        body:
`Per facilitare la manutenzione ordinaria del forno, Vesuviano Forni fornirà insieme all'ordine alcuni componenti di ricambio inclusi nell'offerta, come ad esempio lampade di illuminazione interne, che possono naturalmente usurarsi o spegnersi con il tempo.

Questi componenti permetteranno al cliente, se necessario, di procedere facilmente alla loro sostituzione.`,
      },
      {
        title: '8. Alimentazione elettrica e sbalzi di corrente',
        body:
`Vesuviano Forni non potrà essere ritenuta responsabile per problemi, guasti o danni causati da variazioni di tensione, sovratensioni, interruzioni elettriche, alimentazione elettrica instabile o anomalie provenienti dalla rete elettrica del cliente.

In questi casi, il cliente dovrà rivolgersi alla propria società di energia, al proprio elettricista o al responsabile del proprio impianto elettrico per verificare e risolvere il problema.`,
      },
      {
        title: '9. Garanzia',
        body:
`Il prodotto beneficia di una garanzia di 2 anni contro i difetti di fabbricazione dei componenti forniti da Vesuviano Forni.

La garanzia copre i difetti imputabili alla fabbricazione o ai componenti forniti, nei limiti delle normali condizioni di utilizzo.

Sono esclusi i danni legati a cattiva installazione, cattivo utilizzo, assenza di manutenzione, modifiche non autorizzate, problemi di alimentazione elettrica/gas, canna fumaria, tiraggio o impianti non forniti da Vesuviano Forni.`,
      },
      {
        title: "10. Validazione dell'ordine",
        body:
`L'ordine sarà considerato confermato dopo:
• accettazione scritta dell'offerta / conferma d'ordine;
• emissione della fattura proforma;
• pagamento dell'acconto concordato.`,
      },
    ];
  }

  // Version française (par défaut)
  return [
    {
      title: "1. Objet de la commande",
      body:
`La présente confirmation concerne la fourniture d'un four Vesuviano Forni, selon l'offre mise à jour et la facture proforma transmises au client.

Destination de la marchandise : France.`,
    },
    {
      title: '2. Prix final et conditions commerciales',
      body:
`Le prix final validé à titre exceptionnel est de :

${amountFmt} livraison incluse, selon l'offre mise à jour et la facture proforma.

Ce prix est validé à titre exceptionnel, à condition que la commande soit confirmée et l'acompte payé avant le 10/07/2026.`,
    },
    {
      title: '3. Conditions de paiement',
      body:
`Les conditions de paiement sont les suivantes :

• 50 % d'acompte à la confirmation de la commande ;
• 50 % de solde lorsque le four sera prêt à être expédié, avant l'envoi de la marchandise.

Les coordonnées bancaires seront indiquées dans la facture proforma.`,
    },
    {
      title: '4. Délais de production et de livraison',
      body:
`Les délais estimés sont les suivants :

• Délai de production / fabrication : environ ${productionDays} jours à compter de la réception de l'acompte et de la confirmation complète des informations techniques, fiscales et logistiques ;
• Délai de transport estimé : environ ${shippingDays} jours, selon l'organisation logistique et la disponibilité du transporteur.

Les délais sont indicatifs et peuvent varier en fonction de la production artisanale, de la disponibilité des matériaux, du transporteur ou de causes indépendantes de Vesuviano Forni.`,
    },
    {
      title: '5. Livraison et suivi logistique',
      body:
`La livraison est incluse dans le prix, selon les conditions indiquées dans l'offre et la facture proforma.

Vesuviano Forni s'engage à assurer un suivi sérieux de la livraison, en coordination avec le transporteur / partenaire logistique en charge de l'expédition.

Le client sera informé de l'avancement de la commande, de la production et de l'expédition.

Le déchargement, la manutention interne, les moyens de levage, le chariot élévateur ou tout autre moyen nécessaire sur le lieu de livraison restent à la charge du client, sauf accord écrit contraire.`,
    },
    {
      title: '6. Service après-vente et assistance',
      body:
`Vesuviano Forni s'engage à rester disponible après la livraison pour accompagner le client dans le développement du projet.

Le service après-vente comprend :
• assistance technique à distance ;
• support en cas de problèmes liés au produit fourni ;
• disponibilité pour un diagnostic technique ;
• fourniture éventuelle de pièces de rechange, si nécessaire ;
• accompagnement dans les premières phases d'utilisation, selon les besoins du client.

Vesuviano Forni s'engage à traiter les demandes après-vente de manière réactive et professionnelle.`,
    },
    {
      title: '7. Composants de rechange inclus',
      body:
`Afin de faciliter l'entretien ordinaire du four, Vesuviano Forni fournira avec la commande certains composants de rechange inclus dans l'offre, tels que des lampes d'éclairage internes, qui peuvent naturellement s'user ou s'éteindre avec le temps.

Ces composants permettront au client, si nécessaire, de procéder facilement à leur remplacement.`,
    },
    {
      title: '8. Alimentation électrique et variations de courant',
      body:
`Vesuviano Forni ne pourra être tenue responsable des problèmes, pannes ou dommages causés par des variations de tension, surtensions, coupures électriques, alimentation électrique instable ou anomalies provenant du réseau électrique du client.

Dans ces cas, le client devra s'adresser à sa société d'énergie, à son électricien ou au responsable de son installation électrique pour vérifier et résoudre le problème.`,
    },
    {
      title: '9. Garantie',
      body:
`Le produit bénéficie d'une garantie de 2 ans contre les défauts de fabrication des composants fournis par Vesuviano Forni.

La garantie couvre les défauts imputables à la fabrication ou aux composants fournis, dans les limites des conditions normales d'utilisation.

Sont exclus les dommages liés à une mauvaise installation, une mauvaise utilisation, l'absence d'entretien, des modifications non autorisées, des problèmes d'alimentation électrique/gaz, de conduit de cheminée, de tirage ou d'installations non fournies par Vesuviano Forni.`,
    },
    {
      title: '10. Validation de la commande',
      body:
`La commande sera considérée comme confirmée après :
• acceptation écrite de l'offre / confirmation de commande ;
• émission de la facture proforma ;
• paiement de l'acompte convenu.`,
    },
  ];
}

export async function generateContractPdf(data: ContractData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 15;
  const contentWidth = pageWidth - marginX * 2;
  const logoDataUrl = await loadLogo();
  const supplierSigDataUrl = await loadSupplierSignature();

  // ===== Cover header =====
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageWidth, 34, 'F');

  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, 'PNG', marginX, 8, 42, 18); } catch { /* ignore */ }
  } else {
    doc.setTextColor(245, 158, 11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('VESUVIANO', marginX, 20);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(COMPANY.brand, pageWidth - marginX, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(COMPANY.legal, pageWidth - marginX, 17, { align: 'right' });
  doc.text(`${COMPANY.vat} · ${COMPANY.cf}`, pageWidth - marginX, 21, { align: 'right' });
  doc.text(COMPANY.address, pageWidth - marginX, 25, { align: 'right' });
  doc.text(COMPANY.pec, pageWidth - marginX, 29, { align: 'right' });

  const orderConfirmation = isPietraCalda(data);
  const lang: ContractLanguage = (data.language as ContractLanguage) || (orderConfirmation ? 'fr' : 'it');
  const L = UI_LABELS[lang] || UI_LABELS.it;
  const locale = LOCALE_BY_LANG[lang] || 'it-IT';

  // Localised strings for order confirmation UI (per language)
  const OC = {
    it: {
      title: "CONFERMA D'ORDINE",
      supplier: 'FORNITORE',
      client: 'CLIENTE',
      termsHeader: '— TERMINI E CONDIZIONI GENERALI DI VENDITA —',
      termsIntro: `Le clausole che seguono costituiscono i Termini e le Condizioni Generali di Vendita applicabili al presente ordine e ne formano parte integrante. Il Cliente, sottoscrivendo la presente Conferma d'Ordine, dichiara di averle lette, comprese e accettate integralmente.`,
    },
    fr: {
      title: "CONFIRMATION DE COMMANDE",
      supplier: 'FOURNISSEUR',
      client: 'CLIENT',
      termsHeader: '— CONDITIONS GÉNÉRALES DE VENTE —',
      termsIntro: `Les clauses qui suivent constituent les Conditions Générales de Vente applicables à la présente commande et en font partie intégrante. Le Client, en signant la présente Confirmation de Commande, déclare les avoir lues, comprises et intégralement acceptées.`,
    },
  } as const;
  const ocL = (lang === 'it' ? OC.it : OC.fr);

  // Title
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  const titleText = orderConfirmation ? ocL.title : L.title;
  doc.text(titleText, pageWidth / 2, 46, { align: 'center' });

  const today = data.created_at ? new Date(data.created_at) : new Date();
  const dateStr = today.toLocaleDateString(locale);
  const vf = data.variable_fields || {};
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 90);
  const meta = `${L.date}: ${dateStr}` +
    ((vf.offer_number || data.offer_number) ? `  ·  ${L.offerRef}: ${vf.offer_number || data.offer_number}` : '') +
    `  ·  ${L.client}: ${data.client_name}`;
  doc.text(meta, pageWidth / 2, 52, { align: 'center' });

  // Body sections
  let y = 56;

  // Compact two-column header for Pietra Calda order confirmation
  if (orderConfirmation) {
    const headerColW = (contentWidth - 10) / 2;
    const leftX = marginX;
    const rightX = marginX + headerColW + 10;
    let hy = y;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(ocL.supplier, leftX, hy);
    doc.text(ocL.client, rightX, hy);
    hy += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(45, 45, 45);
    const supplierHeader = [
      'Vesuviano Forni — UNITA 1 di Stanislao Elefante',
      'P.IVA IT02192040661 · C.F. LFNSNS94E20G813Z',
      'Via Piaia, 44 — 67034 Pettorano sul Gizio (AQ) — Italia',
      'PEC u1@pec.it',
    ];
    const clientHeader = [
      "Pietra Calda — SAS L'Arche",
      "Domaine de l'Arche",
      'Route de Houdan',
      '78550 Richebourg — France',
      'TVA: FR79978282820',
    ];
    supplierHeader.forEach((ln) => { doc.text(ln, leftX, hy); hy += 3.5; });
    let hy2 = y + 4;
    clientHeader.forEach((ln) => { doc.text(ln, rightX, hy2); hy2 += 3.5; });

    y = Math.max(hy, hy2) + 5;
  }
  // Order confirmation sections: use native IT/FR content (no AI translation).
  const translatedOrderSections = orderConfirmation
    ? buildOrderConfirmationSections(data, lang)
    : [];
  const termsIntro = orderConfirmation
    ? [{ title: ocL.termsHeader, body: ocL.termsIntro }]
    : [];
  // Only translate the general terms body; keep the intro heading in its native language.
  const translatedTermsSections = [...termsIntro, ...(await translateSections(buildSections(data), lang))];

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // Render order confirmation first (compact, on the opening page)
  translatedOrderSections.forEach((sec) => {
    ensureSpace(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(sec.title, marginX, y);
    y += 3.5;
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.4);
    doc.line(marginX, y, marginX + 30, y);
    y += 1.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(45, 45, 45);
    const paragraphs = sec.body.split('\n');
    paragraphs.forEach((para) => {
      if (para.trim() === '') { y += 0.8; return; }
      const lines = doc.splitTextToSize(para, contentWidth);
      lines.forEach((ln: string) => {
        ensureSpace(3.6);
        doc.text(ln, marginX, y);
        y += 3.6;
      });
      y += 0.6;
    });
    y += 0.8;
  });

  if (orderConfirmation) {
    doc.addPage();
    y = 20;
  }

  // Render general terms and conditions
  translatedTermsSections.forEach((sec) => {
    ensureSpace(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(sec.title, marginX, y);
    y += 5;
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.4);
    doc.line(marginX, y, marginX + 30, y);
    y += 3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(45, 45, 45);
    const paragraphs = sec.body.split('\n');
    paragraphs.forEach((para) => {
      if (para.trim() === '') { y += 2.5; return; }
      const lines = doc.splitTextToSize(para, contentWidth);
      lines.forEach((ln: string) => {
        ensureSpace(5);
        doc.text(ln, marginX, y);
        y += 4.5;
      });
      y += 1.5;
    });
    y += 3;
  });


  // ===== Section 20 — Signatures =====
  ensureSpace(70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(L.section20, marginX, y);
  y += 5;
  doc.setDrawColor(245, 158, 11);
  doc.line(marginX, y, marginX + 30, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(45, 45, 45);
  const accept = doc.splitTextToSize(L.accept, contentWidth);
  accept.forEach((ln: string) => { doc.text(ln, marginX, y); y += 4.5; });
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.text(L.placeDate + ' ', marginX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${V(vf.place_signed || data.place_signed)}  —  ${dateStr}`, marginX + 34, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(L.clientLabel + ' ', marginX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(V(vf.client_name || data.client_name), marginX + 34, y);
  y += 12;

  // ===== Signature block =====
  ensureSpace(70);
  const colW = (contentWidth - 10) / 2;
  const leftX = marginX;
  const rightX = marginX + colW + 10;

  // ---- LEFT: Fornitore (logo + intestazione + firma Stanislao) ----
  let leftY = y;
  if (logoDataUrl) {
    // Small dark badge behind the white logo so it stays visible
    doc.setFillColor(20, 20, 20);
    doc.roundedRect(leftX, leftY, 42, 16, 2, 2, 'F');
    try { doc.addImage(logoDataUrl, 'PNG', leftX + 2, leftY + 2, 38, 12); } catch { /* ignore */ }
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('Vesuviano Forni', leftX + 46, leftY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70);
  doc.text('UNITA 1 di Stanislao Elefante', leftX + 46, leftY + 9);
  doc.text('P.IVA IT02192040661 · C.F. LFNSNS94E20G813Z', leftX + 46, leftY + 12.5);
  doc.text('Via Piaia, 44 — 67034 Pettorano sul Gizio (AQ)', leftX + 46, leftY + 16);
  leftY += 22;

  if (supplierSigDataUrl) {
    try { doc.addImage(supplierSigDataUrl, 'PNG', leftX, leftY, colW, 22); } catch { /* ignore */ }
  }
  leftY += 24;
  doc.setDrawColor(150);
  doc.line(leftX, leftY, leftX + colW, leftY);
  leftY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('Stanislao Elefante', leftX, leftY);
  leftY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(90);
  doc.text('General Director — Vesuviano Forni', leftX, leftY);

  // ---- RIGHT: Cliente (intestazione + box firma) ----
  let rightY = y;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('Cliente', rightX, rightY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70);
  const clientHeader = orderConfirmation
    ? [
        "Pietra Calda — SAS L'Arche",
        "Domaine de l'Arche",
        'Route de Houdan',
        '78550 Richebourg — France',
        'TVA: FR79978282820',
      ]
    : [
        V(vf.client_name || data.client_name),
        ...(data.client_address ? [data.client_address] : []),
        ...(data.client_vat ? [`P.IVA/VAT: ${data.client_vat}`] : []),
      ];
  let hy = rightY + 9;
  clientHeader.forEach((ln) => { doc.text(ln, rightX, hy); hy += 3.8; });
  rightY += 22;

  if (data.client_signature) {
    try { doc.addImage(data.client_signature, 'PNG', rightX, rightY, colW, 22); } catch { /* ignore */ }
  } else {
    // Empty signature box
    doc.setDrawColor(210);
    doc.setLineWidth(0.2);
    doc.roundedRect(rightX, rightY, colW, 22, 1.5, 1.5, 'S');
  }
  rightY += 24;
  doc.setDrawColor(150);
  doc.line(rightX, rightY, rightX + colW, rightY);
  rightY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('Firma del Cliente', rightX, rightY);
  rightY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110);
  if (data.client_signed_at) {
    doc.text(`${L.signedOn} ${new Date(data.client_signed_at).toLocaleString(locale)}`, rightX, rightY);
  } else {
    doc.text('(firma per accettazione)', rightX, rightY);
  }

  y = Math.max(leftY, rightY) + 8;

  // Approvazione ex art. 1341 e 1342 c.c.
  ensureSpace(30);
  doc.setFontSize(8);
  doc.setTextColor(45);
  const approvazione = doc.splitTextToSize(L.approval, contentWidth);
  approvazione.forEach((ln: string) => { doc.text(ln, marginX, y); y += 4; });
  y += 6;
  if (data.client_signature) {
    try {
      doc.addImage(data.client_signature, 'PNG', marginX + contentWidth - 80, y - 14, 80, 14);
    } catch { /* ignore */ }
  }
  doc.line(marginX + contentWidth - 80, y, marginX + contentWidth, y);
  doc.text(L.approvalSig, marginX + contentWidth - 80, y + 4);

  // ===== Footer with page numbers =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`${L.page} ${i} ${L.of} ${pageCount}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
    doc.text(L.footer, marginX, pageHeight - 7);
  }


  return doc;
}

// Legacy exports (kept for compatibility)
export const DEFAULT_CLAUSES: ContractClause[] = [];
export const DEFAULT_PAYMENT_TERMS =
  "50% di acconto alla conferma dell'ordine (bonifico bancario), 50% a saldo a merce pronta per la spedizione, previo invio al Cliente di supporto fotografico dei prodotti finiti.";
