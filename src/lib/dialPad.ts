import { AsYouType, parsePhoneNumberFromString, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';

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
  return phone ? phone.number : null;
}
