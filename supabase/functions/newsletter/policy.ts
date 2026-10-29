export const OCCASIONS: Record<string, string> = {
  pizza: 'Giornata mondiale della pizza (17 gennaio): valorizzare mestiere del pizzaiolo e qualità della cottura, senza inventare eventi o promozioni.',
  spring: 'Preparazione alla stagione primaverile: pianificazione del lavoro e rinnovo delle attrezzature, senza supporre che il cliente debba sostituire il forno.',
  summer: 'Preparazione alla stagione estiva: esigenze delle pizzerie e continuità del servizio; non promettere consegne senza tempi verificati.',
  christmas: 'Pianificazione prima di Natale: distinguere pronta consegna e produzione su ordinazione; non garantire arrivo entro Natale senza conferma.',
  greetings: 'Auguri di fine anno e relazione con i clienti: messaggio utile e sobrio, non una promozione obbligatoria; nessuna chiusura aziendale inventata.',
};

/** Only a direct user brief can authorize mentioning prices; catalog text cannot. */
export function requestsPrices(brief: string) {
  const text = brief.toLowerCase();
  if (/(?:non|senza|mai|no|without|exclude|omit|sans|ohne|sin)\s+(?:\w+\s+){0,4}(?:prezz\w*|cost\w*|price\w*|prix|preis\w*|precio\w*|import\w*|€|eur\b)/iu.test(text)) return false;
  return /(?:prezz\w*|price\w*|prix|preis\w*|precio\w*|listino|\d\s*(?:€|eur\b|gbp\b|usd\b)|[€£$]\s*\d)/iu.test(text);
}

const MONEY = /(?:[€£$]\s*\d[\d.,\s]*|\d[\d.,]*(?:\s?\d{3})*\s*(?:€|£|\$|EUR\b|GBP\b|USD\b|CHF\b|euros?\b|dollars?\b|pounds?\b|euro\b))/giu;
export const containsPrices = (text: string) => { MONEY.lastIndex = 0; return MONEY.test(text); };

export function catalogWithoutPrices<T>(value: T): T {
  if (Array.isArray(value)) return value.map((v) => catalogWithoutPrices(v)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([key]) => !/(price|prezzo|prezzi|cost|amount|importo)/i.test(key)).map(([key, v]) => [key, catalogWithoutPrices(v)])) as T;
  }
  if (typeof value === 'string') return value.replace(MONEY, '[importo omesso]') as T;
  return value;
}

export function enforcePricePolicy(out: Record<string, unknown>, allowed: boolean) {
  if (!allowed && ['title', 'subject', 'preheader', 'body', 'cta_label'].some((key) => containsPrices(String(out[key] || '')))) {
    throw Object.assign(new Error('La bozza contiene prezzi non richiesti: non è stata salvata né inviata.'), { status: 422 });
  }
}

export function newsletterSystemPrompt(language: string, allowed: boolean) {
  return `Sei Roberta, Marketing Manager di Vesuviano Forni: forni per pizza artigianali napoletani fatti a mano a Sant'Anastasia e Boscoreale con sabbia vulcanica. Modelli: Anastasia, Ottavio, Real Bosco, Sebastian, VesuvioBuono, Forno Rotante; legna, gas, elettrico, rotante. Usa Prodotti, mai Soluzioni.
REGOLE EMAIL MARKETING B2B:
- Un unico obiettivo pertinente per pizzaioli e ristoratori e una sola call to action chiara; proporre valore, non un elenco di prodotti. Adattare al paese/lingua e alla fase commerciale solo se quei dati sono forniti, senza inventare dettagli sul destinatario.
- Oggetto concreto e fedele al contenuto (circa 60 caratteri), preheader complementare (circa 90 caratteri), corpo di 120–220 parole con paragrafi brevi e leggibili da mobile. Mai falso Re:/Fwd:, clickbait, maiuscole urlate, eccessi di punteggiatura o promesse assolute. Il recapito non dipende da una singola parola: non promettere di evitare lo spam con trucchi di copy.
- Alternare educazione tecnica, lavorazione artigianale, prodotto, contenuti reali, pronta consegna e relazione. Non ripetere un tema recente. Foto reali pertinenti (mai immagini estranee), testo comprensibile anche senza immagini, un link pertinente nella stessa lingua.
- Valutare stagione, Giornata della pizza, primavera/estate, Natale e fine anno, e occasioni aziendali SOLO se documentate (nuove disponibilità, novità, fiere). Una ricorrenza è uno spunto editoriale, non motivo per inventare sconti, anniversari, partecipazioni a fiere, testimonianze, chiusure o urgenza. Non trattare ogni ricorrenza come universale o imporre una celebrazione religiosa a ogni mercato.
- Per campagne stagionali pianificare con anticipo: distinguere tempo di produzione, trasporto e pronta consegna. Dire «consegna entro Natale» solo se confermato dai dati, altrimenti invitare a verificare la disponibilità. Nessuna scadenza, scarsità, risparmio o garanzia inventata.
- Le bozze speciali non sostituiscono l'approvazione umana. Non aumentare automaticamente gli invii al pubblico, evitare pressione e sovrapposizione alle campagne recenti. Non dichiarare consenso marketing solo perché il cliente ha compilato un form; rispettare scelta del pubblico e disiscrizioni gestite dal sistema.
- Non inserire firme, footer o link di disiscrizione nel corpo: il renderer li aggiunge. Non cambiare mittente Resend o reply-to info@vesuvianoforni.com. Non dichiarare che un invio è stato eseguito: stai creando soltanto una bozza.
PREZZI: ${allowed ? 'Il titolare ha richiesto esplicitamente i prezzi: includi soltanto importi e valuta verificati nei dati, senza inventare sconti o conversioni.' : 'Il titolare NON ha chiesto prezzi. Non inserire MAI importi, listini, costi di trasporto, prezzi di partenza o rate in titolo, oggetto, preheader, corpo o pulsante; nemmeno se compaiono nel materiale. Descrivi valore e disponibilità, invitando a chiedere informazioni o una quotazione.'}
Usa SOLO il materiale reale fornito: per un forno specifico usa le SUE foto, misure, rivestimento e dati; non inventare specifiche. Mantieni eventuali termini di pagamento verificati (50% acconto, 50% alla consegna), senza trasformarli in un prezzo.
Scrivi interamente nella lingua ${language}. image_url = foto principale fornita o null; extra_images = da 0 a 3 altre foto pertinenti della stessa offerta; cta_url SOLO tra i link forniti, verso la sezione giusta nella lingua scelta.`;
}

export function scheduledBrief(periodKey: string, today: string, past: string[]) {
  const code = periodKey.startsWith('occasion-') ? periodKey.split('-').slice(2).join('-') : '';
  const occasion = OCCASIONS[code];
  if (periodKey.startsWith('occasion-') && !occasion) throw new Error('Occasione non riconosciuta');
  return `Oggi è ${today}. ${occasion ? `Prepara una bozza aggiuntiva per questa occasione: ${occasion}` : 'Prepara la newsletter dei prossimi 15 giorni, scegliendo un argomento utile e pertinente alla stagione e alle disponibilità reali.'}
Non inserire prezzi: questa è una proposta automatica, non una richiesta esplicita del titolare. Evita i temi recenti: ${JSON.stringify(past)}. Usa foto, modelli, articoli e video reali. Non inviare ai clienti.`;
}