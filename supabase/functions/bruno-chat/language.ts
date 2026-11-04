// Lingua del cliente: prefisso telefonico, poi paese. Fallback inglese per esteri, italiano per Italia.
const PREFIX: [string, string][] = [
  ['+39', 'it'], ['+44', 'en'], ['+353', 'en'], ['+1', 'en'], ['+61', 'en'], ['+33', 'fr'], ['+32', 'fr'],
  ['+352', 'fr'], ['+377', 'fr'], ['+41', 'de'], ['+49', 'de'], ['+43', 'de'], ['+34', 'es'], ['+52', 'es'],
  ['+54', 'es'], ['+56', 'es'], ['+57', 'es'],
];
const COUNTRY: Record<string, string> = {
  it: 'it', italy: 'it', italia: 'it', uk: 'en', gb: 'en', 'united kingdom': 'en', ireland: 'en', us: 'en', usa: 'en',
  fr: 'fr', france: 'fr', francia: 'fr', belgium: 'fr', belgio: 'fr', de: 'de', germany: 'de', germania: 'de',
  austria: 'de', at: 'de', es: 'es', spain: 'es', spagna: 'es', mexico: 'es',
};
export function customerLanguage(lead: { phone?: string | null; country?: string | null }): string {
  let p = (lead.phone || '').replace(/[^\d+]/g, '');
  if (p.startsWith('00')) p = '+' + p.slice(2);
  if (p.startsWith('+')) {
    const hit = PREFIX.filter(([k]) => p.startsWith(k)).sort((a, b) => b[0].length - a[0].length)[0];
    if (hit) return hit[1];
    return 'en';
  }
  if (/^3\d{8,9}$/.test(p)) return 'it';
  const c = COUNTRY[(lead.country || '').trim().toLowerCase()];
  return c || (lead.country ? 'en' : 'it');
}
