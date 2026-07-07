import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ContractClause {
  title: string;
  content: string;
}

export interface ContractData {
  id?: string;
  client_name: string;
  client_email?: string | null;
  client_address?: string | null;
  client_vat?: string | null;
  offer_number?: string | null;
  total_amount: number;
  currency: string;
  payment_terms: string;
  warranty_years: number;
  clauses: ContractClause[];
  created_at?: string;
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

export async function generateContractPdf(data: ContractData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 15;
  const logoDataUrl = await loadLogo();

  // Header banner (dark)
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageWidth, 34, 'F');

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', marginX, 8, 42, 18);
    } catch { /* ignore */ }
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

  // Title
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CONTRATTO DI FORNITURA', pageWidth / 2, 46, { align: 'center' });

  const today = data.created_at ? new Date(data.created_at) : new Date();
  const dateStr = today.toLocaleDateString('it-IT');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 90);
  doc.text(`Data: ${dateStr}${data.offer_number ? `  ·  Rif. Offerta: ${data.offer_number}` : ''}`, pageWidth / 2, 52, { align: 'center' });

  // Parties table
  autoTable(doc, {
    startY: 58,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3, textColor: [30, 30, 30] },
    headStyles: { fillColor: [245, 158, 11], textColor: 20, fontStyle: 'bold' },
    head: [['Fornitore', 'Cliente']],
    body: [[
      `${COMPANY.brand}\n${COMPANY.legal}\n${COMPANY.vat}\n${COMPANY.cf}\n${COMPANY.address}\n${COMPANY.pec}`,
      `${data.client_name}${data.client_vat ? `\nP.IVA/CF: ${data.client_vat}` : ''}${data.client_address ? `\n${data.client_address}` : ''}${data.client_email ? `\n${data.client_email}` : ''}`,
    ]],
    columnStyles: { 0: { cellWidth: (pageWidth - marginX * 2) / 2 }, 1: { cellWidth: (pageWidth - marginX * 2) / 2 } },
    margin: { left: marginX, right: marginX },
  });

  // Economic summary
  const amountFmt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: data.currency || 'EUR' }).format(data.total_amount || 0);
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 4,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    head: [['Condizioni economiche', '']],
    headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold' },
    body: [
      ['Numero offerta di riferimento', data.offer_number || '—'],
      ['Importo complessivo', amountFmt],
      ['Modalità di pagamento', data.payment_terms],
      ['Garanzia', `${data.warranty_years} ${data.warranty_years === 1 ? 'anno' : 'anni'} dalla consegna`],
    ],
    columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' }, 1: { cellWidth: pageWidth - marginX * 2 - 60 } },
    margin: { left: marginX, right: marginX },
  });

  // Clauses
  let y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text('Termini e Condizioni', marginX, y);
  y += 5;

  data.clauses.forEach((cl, idx) => {
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    const title = `Art. ${idx + 1} — ${cl.title}`;
    doc.text(title, marginX, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(45, 45, 45);
    const lines = doc.splitTextToSize(cl.content, pageWidth - marginX * 2);
    lines.forEach((ln: string) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(ln, marginX, y);
      y += 4.5;
    });
    y += 3;
  });

  // Signatures
  if (y > 240) { doc.addPage(); y = 30; } else { y += 10; }
  doc.setDrawColor(150);
  doc.line(marginX, y + 15, marginX + 70, y + 15);
  doc.line(pageWidth - marginX - 70, y + 15, pageWidth - marginX, y + 15);
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text('Il Fornitore', marginX, y + 20);
  doc.setFontSize(7.5);
  doc.text('VESUVIANO FORNI — UNITA 1 di Stanislao Elefante', marginX, y + 24);
  doc.setFontSize(9);
  doc.text('Il Cliente', pageWidth - marginX - 70, y + 20);
  doc.setFontSize(7.5);
  doc.text('(timbro e firma per accettazione)', pageWidth - marginX - 70, y + 24);

  // Approvazione specifica ex art. 1341 c.c.
  y += 32;
  if (y > 265) { doc.addPage(); y = 30; }
  doc.setFontSize(8);
  doc.setTextColor(45);
  const approvazione = doc.splitTextToSize(
    'Ai sensi e per gli effetti degli artt. 1341 e 1342 c.c., il Cliente dichiara di aver letto e di approvare specificamente le clausole relative a: pagamento, garanzia, riservato dominio, forza maggiore, foro competente.',
    pageWidth - marginX * 2,
  );
  doc.text(approvazione, marginX, y);
  y += approvazione.length * 4 + 8;
  doc.line(pageWidth - marginX - 70, y, pageWidth - marginX, y);
  doc.text('Firma del Cliente', pageWidth - marginX - 70, y + 4);

  // Footer page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Pagina ${i} di ${pageCount}`, pageWidth - marginX, 290, { align: 'right' });
    doc.text('vesuvianoforni.com', marginX, 290);
  }

  return doc;
}

export const DEFAULT_CLAUSES: ContractClause[] = [
  {
    title: 'Oggetto del contratto',
    content: 'Il Fornitore si impegna a fornire al Cliente i forni professionali e gli accessori indicati nell\'offerta di riferimento sopra citata, secondo le specifiche tecniche, i materiali e le finiture concordate. L\'offerta di riferimento costituisce parte integrante del presente contratto.',
  },
  {
    title: 'Prezzo e modalità di pagamento',
    content: 'Il corrispettivo complessivo indicato nel presente contratto è espresso al netto di IVA di legge, ove applicabile. Il pagamento è così articolato: 50% a titolo di acconto alla sottoscrizione del contratto/conferma dell\'ordine, 50% a saldo a merce pronta per la spedizione, previo invio al Cliente di supporto fotografico dei prodotti finiti. Il mancato pagamento nei termini pattuiti costituisce inadempimento e legittima il Fornitore a sospendere la produzione o la consegna.',
  },
  {
    title: 'Tempi di produzione e consegna',
    content: 'I tempi di produzione decorrono dall\'accredito dell\'acconto e dalla definizione di tutti i dettagli tecnici ed estetici. I termini di consegna sono indicativi e potranno subire variazioni per cause non imputabili al Fornitore. La spedizione avviene EXW dallo stabilimento salvo diverso accordo scritto.',
  },
  {
    title: 'Garanzia',
    content: 'Il Fornitore garantisce i prodotti per un periodo di 12 (dodici) mesi dalla data di consegna contro difetti di fabbricazione dei materiali e della lavorazione. La garanzia non copre danni derivanti da uso improprio, installazione non conforme, manutenzione carente, normale usura o interventi effettuati da personale non autorizzato. Eventuali difetti dovranno essere segnalati per iscritto entro 8 giorni dalla scoperta.',
  },
  {
    title: 'Trasporto, imballo e rischio',
    content: 'Salvo diversa pattuizione scritta, il trasporto è a carico e a rischio del Cliente. Il Fornitore imballa la merce a regola d\'arte secondo standard idonei al trasporto internazionale. Il rischio del perimento o deterioramento della merce si trasferisce al Cliente al momento della consegna al vettore.',
  },
  {
    title: 'Riservato dominio',
    content: 'La proprietà dei prodotti resta in capo al Fornitore fino al pagamento integrale del prezzo pattuito, ai sensi e per gli effetti dell\'art. 1523 c.c. In caso di mancato pagamento, il Fornitore ha facoltà di riprendere possesso dei beni.',
  },
  {
    title: 'Forza maggiore',
    content: 'Nessuna delle Parti sarà responsabile per il ritardo o l\'inadempimento delle obbligazioni derivanti da cause di forza maggiore, ivi inclusi, a titolo esemplificativo: calamità naturali, scioperi, provvedimenti dell\'autorità, interruzioni delle forniture di materie prime o energia, pandemie, conflitti armati.',
  },
  {
    title: 'Riservatezza e trattamento dati (GDPR)',
    content: 'Le Parti si obbligano reciprocamente alla riservatezza sulle informazioni tecniche, commerciali ed economiche scambiate. I dati personali sono trattati ai sensi del Regolamento UE 2016/679 (GDPR) e della normativa italiana applicabile, esclusivamente per finalità connesse all\'esecuzione del contratto.',
  },
  {
    title: 'Legge applicabile e foro competente',
    content: 'Il presente contratto è regolato dalla legge italiana. Per ogni controversia inerente l\'interpretazione, l\'esecuzione o la risoluzione del presente contratto sarà competente in via esclusiva il Foro di Napoli.',
  },
];

export const DEFAULT_PAYMENT_TERMS =
  '50% di acconto alla conferma dell\'ordine (bonifico bancario), 50% a saldo a merce pronta per la spedizione, previo invio al Cliente di supporto fotografico dei prodotti finiti.';
