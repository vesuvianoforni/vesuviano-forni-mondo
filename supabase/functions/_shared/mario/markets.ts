// Single source of truth for Mario's European markets. Italy is never a market; Germany is research-only (UWG).
export const MARIO_COUNTRIES = ['UK','FR','ES','NL','BE','IE','AT','CH','PT','DK','SE','NO','FI','PL','CZ','LU','DE'] as const;
export type MarioCountry = typeof MARIO_COUNTRIES[number];
export const MANUAL_ONLY: readonly string[] = ['DE'];
export const SEND_COUNTRIES = MARIO_COUNTRIES.filter(c => !MANUAL_ONLY.includes(c));
export const COUNTRY_NAME: Record<MarioCountry, string> = {
  UK: 'United Kingdom', FR: 'France', ES: 'Spain', NL: 'Netherlands', BE: 'Belgium', IE: 'Ireland', AT: 'Austria', CH: 'Switzerland',
  PT: 'Portugal', DK: 'Denmark', SE: 'Sweden', NO: 'Norway', FI: 'Finland', PL: 'Poland', CZ: 'Czech Republic', LU: 'Luxembourg', DE: 'Germany',
};
export const emailLanguage = (country: string) => (country === 'FR' ? 'fr' : 'en');
