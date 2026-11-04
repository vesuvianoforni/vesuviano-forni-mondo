// Ready-to-ship WhatsApp follow-up rules: working hours (Rome, Mon–Sat 9–19) and localized text.
export const BOOKING_URL = 'https://vesuvianoforni.com/book-a-slot-call';
export const FOLLOWUP_DELAY_MIN = 0;
const OPEN_HOUR = 9;
const CLOSE_HOUR = 19;

function romeParts(d: Date) {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? '';
  return { weekday: get('weekday'), hour: Number(get('hour')), minute: Number(get('minute')) };
}

export function isWorkingTime(d: Date): boolean {
  const { weekday, hour } = romeParts(d);
  return weekday !== 'Sun' && hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

/** First working moment (Rome, Mon–Sat 9–19) at or after `from`, scanned in 5-minute steps. */
export function nextWorkingSlot(from: Date): Date {
  if (isWorkingTime(from)) return from;
  let t = new Date(Math.ceil(from.getTime() / 60000) * 60000);
  for (let i = 0; i < 3000 && !isWorkingTime(t); i++) {
    const { hour, minute } = romeParts(t);
    // jump fast outside hours, then fine-step to the exact opening minute
    const step = hour === OPEN_HOUR - 1 ? 1 : (minute === 0 ? 60 : 60 - minute);
    t = new Date(t.getTime() + step * 60000);
  }
  return t;
}

export function followupDueAt(now: Date): Date {
  return nextWorkingSlot(new Date(now.getTime() + FOLLOWUP_DELAY_MIN * 60000));
}

const TEXT: Record<string, (n: string, m: string, e: string) => string> = {
  it: (n, m, e) => `Ciao ${n}, sono Gennaro Caglione, Export Manager di Vesuviano Forni.\nTi abbiamo appena inviato via email (${e}) l’offerta con foto e PDF del forno ${m} in pronta consegna.\n\nCi fai sapere se non l'hai ricevuto? Controlla anche in spam.\nSe ti fa piacere, puoi prenotare una chiamata con me qui: ${BOOKING_URL}\n\nGennaro`,
  en: (n, m, e) => `Hi ${n}, this is Gennaro Caglione, Export Manager at Vesuviano Forni.\nWe have just emailed you (${e}) the offer with photos and PDF for the ready-to-ship ${m} oven.\n\nCould you let us know if you haven't received it? Please check your spam folder too.\nIf you like, you can book a call with me here: ${BOOKING_URL}\n\nGennaro`,
  fr: (n, m, e) => `Bonjour ${n}, je suis Gennaro Caglione, Export Manager chez Vesuviano Forni.\nNous venons de vous envoyer par email (${e}) l’offre avec photos et PDF du four ${m} prêt à expédier.\n\nPouvez-vous nous dire si vous ne l'avez pas reçu ? Pensez à vérifier vos spams.\nSi vous le souhaitez, vous pouvez réserver un appel avec moi ici : ${BOOKING_URL}\n\nGennaro`,
  de: (n, m, e) => `Hallo ${n}, hier ist Gennaro Caglione, Export Manager bei Vesuviano Forni.\nWir haben Ihnen soeben per E-Mail (${e}) das Angebot mit Fotos und PDF für den sofort lieferbaren Ofen ${m} geschickt.\n\nGeben Sie uns bitte Bescheid, falls es nicht angekommen ist? Bitte prüfen Sie auch den Spam-Ordner.\nWenn Sie möchten, können Sie hier ein Gespräch mit mir buchen: ${BOOKING_URL}\n\nGennaro`,
  es: (n, m, e) => `Hola ${n}, soy Gennaro Caglione, Export Manager de Vesuviano Forni.\nTe acabamos de enviar por email (${e}) la oferta con fotos y PDF del horno ${m} listo para envío.\n\n¿Nos avisas si no lo has recibido? Revisa también la carpeta de spam.\nSi te apetece, puedes reservar una llamada conmigo aquí: ${BOOKING_URL}\n\nGennaro`,
};

export function followupText(language: string, firstName: string, model: string, email: string): string {
  const lang = (language || 'it').slice(0, 2).toLowerCase();
  return (TEXT[lang] ?? TEXT.en)(firstName.trim() || '', model, email);
}
