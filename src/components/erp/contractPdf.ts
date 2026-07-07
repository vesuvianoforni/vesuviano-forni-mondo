import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

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

async function loadLogo(): Promise<string | null> {
  try {
    const res = await fetch('/lovable-uploads/vesuviano-logo-bianco.png');
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

export async function generateContractPdf(data: ContractData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 15;
  const contentWidth = pageWidth - marginX * 2;
  const logoDataUrl = await loadLogo();

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

  const lang: ContractLanguage = (data.language as ContractLanguage) || 'it';
  const L = UI_LABELS[lang] || UI_LABELS.it;
  const locale = LOCALE_BY_LANG[lang] || 'it-IT';

  // Title
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(L.title, pageWidth / 2, 46, { align: 'center' });

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

  // Body sections (translated if needed)
  let y = 60;
  const italianSections = buildSections(data);
  const sections = await translateSections(italianSections, lang);

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  };

  sections.forEach((sec) => {
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
  doc.text('20. Accettazione delle Condizioni Generali di Vendita', marginX, y);
  y += 5;
  doc.setDrawColor(245, 158, 11);
  doc.line(marginX, y, marginX + 30, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(45, 45, 45);
  const accept = doc.splitTextToSize(
    "Il Cliente dichiara di aver letto, compreso e accettato integralmente le presenti Condizioni Generali di Vendita.",
    contentWidth,
  );
  accept.forEach((ln: string) => { doc.text(ln, marginX, y); y += 4.5; });
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.text(`Luogo e data: `, marginX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${V(vf.place_signed || data.place_signed)}  —  ${dateStr}`, marginX + 30, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente: ', marginX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(V(vf.client_name || data.client_name), marginX + 30, y);
  y += 12;

  // Signature lines
  ensureSpace(40);
  const colW = (contentWidth - 10) / 2;

  // Embed client signature image above the line if present
  if (data.client_signature) {
    try {
      doc.addImage(data.client_signature, 'PNG', marginX, y - 2, colW, 16);
    } catch { /* ignore */ }
  }

  doc.setDrawColor(150);
  doc.line(marginX, y + 15, marginX + colW, y + 15);
  doc.line(marginX + colW + 10, y + 15, marginX + contentWidth, y + 15);
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text('Firma del Cliente', marginX, y + 20);
  doc.text('Vesuviano Forni — UNITA 1 di Stanislao Elefante', marginX + colW + 10, y + 20);
  doc.setFontSize(7.5);
  doc.setTextColor(110);
  if (data.client_signed_at) {
    doc.text(`Firmato digitalmente il ${new Date(data.client_signed_at).toLocaleString('it-IT')}`, marginX, y + 24);
  } else {
    doc.text('(timbro e firma per accettazione)', marginX, y + 24);
  }
  doc.text('Il Fornitore', marginX + colW + 10, y + 24);
  y += 34;

  // Approvazione ex art. 1341 e 1342 c.c.
  ensureSpace(30);
  doc.setFontSize(8);
  doc.setTextColor(45);
  const approvazione = doc.splitTextToSize(
    'Ai sensi e per gli effetti degli artt. 1341 e 1342 c.c., il Cliente dichiara di approvare specificamente le clausole di cui ai punti: 3 (accordi di pagamento), 4 (acconto e rimborsi), 6 (tempi non essenziali), 7 (deposito e risoluzione), 8 (trasporto e rischio), 10 (scarico), 11 (installazione), 12 (tolleranze), 13 (garanzia), 14 (esclusione risultato), 16 (riserva di proprietà), 17 (forza maggiore), 18 (foro competente).',
    contentWidth,
  );
  approvazione.forEach((ln: string) => { doc.text(ln, marginX, y); y += 4; });
  y += 6;
  if (data.client_signature) {
    try {
      doc.addImage(data.client_signature, 'PNG', marginX + contentWidth - 80, y - 14, 80, 14);
    } catch { /* ignore */ }
  }
  doc.line(marginX + contentWidth - 80, y, marginX + contentWidth, y);
  doc.text('Firma del Cliente per approvazione specifica', marginX + contentWidth - 80, y + 4);

  // ===== Footer with page numbers =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Pagina ${i} di ${pageCount}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
    doc.text('vesuvianoforni.com  ·  Condizioni Generali di Vendita', marginX, pageHeight - 7);
  }

  return doc;
}

// Legacy exports (kept for compatibility)
export const DEFAULT_CLAUSES: ContractClause[] = [];
export const DEFAULT_PAYMENT_TERMS =
  "50% di acconto alla conferma dell'ordine (bonifico bancario), 50% a saldo a merce pronta per la spedizione, previo invio al Cliente di supporto fotografico dei prodotti finiti.";
