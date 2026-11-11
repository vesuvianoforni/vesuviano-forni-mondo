import { AsYouType, parsePhoneNumberFromString, getCountryCallingCode, getCountries, type CountryCode } from 'libphonenumber-js';

export const DIAL_COUNTRIES: { code: CountryCode; name: string; flag: string }[] = [
  { code: 'IT', name: 'Italia', flag: '🇮🇹' }, { code: 'GB', name: 'Regno Unito', flag: '🇬🇧' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' }, { code: 'DE', name: 'Germania', flag: '🇩🇪' },
  { code: 'ES', name: 'Spagna', flag: '🇪🇸' }, { code: 'IE', name: 'Irlanda', flag: '🇮🇪' },
  { code: 'NL', name: 'Paesi Bassi', flag: '🇳🇱' }, { code: 'BE', name: 'Belgio', flag: '🇧🇪' },
  { code: 'CH', name: 'Svizzera', flag: '🇨🇭' }, { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'PT', name: 'Portogallo', flag: '🇵🇹' }, { code: 'US', name: 'Stati Uniti', flag: '🇺🇸' },
];

const regionName = typeof Intl !== 'undefined' && 'DisplayNames' in Intl ? new Intl.DisplayNames(['it'], { type: 'region' }) : null;
export const flagOf = (cc?: string) => cc ? String.fromCodePoint(...[...cc.toUpperCase()].map(c => 0x1f1e6 + c.charCodeAt(0) - 65)) : '🌐';
export const countryName = (cc?: string) => (cc && regionName?.of(cc)) || cc || 'Paese sconosciuto';
export const callingCode = (cc: CountryCode) => `+${getCountryCallingCode(cc)}`;

/** Keeps only dialable characters; "00" becomes "+". */
export function cleanDial(raw: string) {
  const kept = raw.replace(/[^\d+]/g, '');
  const plus = kept.startsWith('+') || kept.startsWith('00');
  return (plus ? '+' : '') + kept.replace(/^00/, '').replace(/\+/g, '');
}

export function parseDial(raw: string, fallback: CountryCode) {
  const input = cleanDial(raw);
  const formatter = new AsYouType(input.startsWith('+') ? undefined : fallback);
  const formatted = formatter.input(input);
  const phone = parsePhoneNumberFromString(input, fallback);
  const country = phone?.country ?? formatter.getCountry() ?? (input.startsWith('+') ? undefined : fallback);
  return {
    input, formatted, country,
    valid: Boolean(phone?.isValid()),
    e164: phone?.isValid() ? phone.number : null,
    type: phone?.getType(),
  };
}

/** Comparable key for matching CRM numbers saved in different formats. */
export function phoneKey(raw: string | null | undefined, fallback: CountryCode = 'IT') {
  if (!raw) return null;
  const phone = parsePhoneNumberFromString(cleanDial(raw), fallback);
  return phone?.isValid() ? phone.number : null;
}

const countryAliases: Record<string, CountryCode> = {
  uk: 'GB', 'united kingdom': 'GB', england: 'GB', inghilterra: 'GB', 'great britain': 'GB',
  ireland: 'IE', eire: 'IE', italia: 'IT', italy: 'IT', france: 'FR', francia: 'FR',
  germany: 'DE', germania: 'DE', deutschland: 'DE', spain: 'ES', spagna: 'ES',
};
export function crmPhoneCountry(raw: string | null | undefined): CountryCode | undefined {
  const value = raw?.trim();
  if (!value) return undefined;
  const code = value.toUpperCase();
  if (getCountries().includes(code as CountryCode)) return code as CountryCode;
  return countryAliases[value.toLowerCase()] ?? DIAL_COUNTRIES.find(c => c.name.toLowerCase() === value.toLowerCase())?.code;
}

type PhoneContact = { id: string; phone?: string | null | undefined; country?: string | null | undefined };
/** Compare complete valid numbers. A dialled country can resolve a local number only
 * when its recorded country is missing or cannot produce a valid number. */
export function matchingDialContacts<T extends PhoneContact>(leads: readonly T[], destination: string): T[] {
  const dialled = parsePhoneNumberFromString(cleanDial(destination));
  if (!dialled?.isValid()) return [];
  return leads.filter(lead => {
    if (!lead.phone) return false;
    const input = cleanDial(lead.phone);
    if (input.startsWith('+')) return phoneKey(input) === dialled.number;
    const recordedCountry = crmPhoneCountry(lead.country);
    const primary = recordedCountry ? phoneKey(input, recordedCountry) : null;
    if (primary) return primary === dialled.number;
    return dialled.country ? phoneKey(input, dialled.country) === dialled.number : false;
  });
}

export async function readPhoneContacts<T>(readPage: (from: number, to: number) => Promise<T[]>): Promise<T[]> {
  const all: T[] = [];
  for (let from = 0; ; from += 1000) {
    const page = await readPage(from, from + 999);
    all.push(...page);
    if (page.length < 1000) return all;
  }
}
