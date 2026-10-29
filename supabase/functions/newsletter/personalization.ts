/** Names are recorded CRM data, never inferred from an address, company or AI output. */
export function newsletterRecipientName(value?: string | null): string | null {
  const name = (value || '').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!name || name.length > 160 || !/\p{L}/u.test(name) || /[<>{}@]|https?:\/\//i.test(name)) return null;
  if (/^(?:n\/?a|n\/?d|null|undefined|unknown|sconosciuto|non disponibile|cliente|lead|contatto|test|prova|[-–—]+)$/i.test(name)) return null;
  return name;
}

const GREETINGS: Record<string, string> = { it: 'Ciao', en: 'Hello', fr: 'Bonjour', de: 'Guten Tag', es: 'Hola' };
export function newsletterGreeting(language: string, name?: string | null) {
  const safeName = newsletterRecipientName(name);
  return `${GREETINGS[language] || GREETINGS.it}${safeName ? ` ${safeName}` : ''},`;
}

/** Replace a standalone opening salutation in older drafts, without touching substantive paragraphs. */
export function newsletterBody(body: string) {
  return body.replace(/\r\n/g, '\n').trimStart().replace(/^(?:ciao|buongiorno|salve|gentile|gentili|hello|hi|dear|bonjour|bonsoir|cher|chère|chers|chères|guten tag|hallo|hola|estimado|estimada|estimados|estimadas)(?:[ \t]+[^\n,!:]{1,100})?[,!:][ \t]*(?:\n+|$)/iu, '').trimStart();
}