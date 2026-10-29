import { parsePhoneNumberFromString } from 'npm:libphonenumber-js@1.12.24';

export const LANGUAGES = ['it', 'en', 'fr', 'de', 'es'] as const;
export type Language = typeof LANGUAGES[number];
export type Version = { subject: string; preheader: string; body: string; cta_label: string | null; cta_url: string | null };
export type LocalizedCampaign = Version & {
  language: string; image_url: string | null; extra_images?: string[];
  translations?: Partial<Record<Language, Version>>; translation_source?: string | null;
};

const COUNTRY_LANGUAGE: Record<string, Language> = {
  IT: 'it', GB: 'en', IE: 'en', US: 'en', CA: 'en', AU: 'en', NZ: 'en',
  FR: 'fr', DE: 'de', AT: 'de', ES: 'es', MX: 'es', AR: 'es', CL: 'es', CO: 'es', PE: 'es',
};
const COUNTRY_ALIASES: Record<string, string> = {
  italia: 'IT', italy: 'IT', uk: 'GB', 'united kingdom': 'GB', 'regno unito': 'GB',
  england: 'GB', 'gran bretagna': 'GB', france: 'FR', francia: 'FR',
  germany: 'DE', germania: 'DE', deutschland: 'DE', spain: 'ES', spagna: 'ES', españa: 'ES',
  usa: 'US', 'united states': 'US', 'stati uniti': 'US', ireland: 'IE', irlanda: 'IE',
  austria: 'AT', australia: 'AU', canada: 'CA', mexico: 'MX', messico: 'MX',
};

/** International dialing codes are an estimate, not a customer's declared language. */
export function recipientLanguage(phone?: string | null, country?: string | null, fallback: string = 'it'): Language {
  const normalized = (phone || '').trim().replace(/^00/, '+').replace(/[\s().-]/g, '');
  if (normalized.startsWith('+')) {
    const parsed = parsePhoneNumberFromString(normalized);
    if (parsed?.isPossible() && parsed.country && COUNTRY_LANGUAGE[parsed.country]) return COUNTRY_LANGUAGE[parsed.country];
    // Shared or unsupported calling regions cannot reliably identify a language.
    if (parsed?.isPossible()) return LANGUAGES.includes(fallback as Language) ? fallback as Language : 'it';
  }
  const key = (country || '').trim().toLowerCase();
  const code = COUNTRY_ALIASES[key] || key.toUpperCase();
  return COUNTRY_LANGUAGE[code] || (LANGUAGES.includes(fallback as Language) ? fallback as Language : 'it');
}

export function contentSource(c: LocalizedCampaign) {
  return JSON.stringify([c.language, c.subject, c.preheader, c.body, c.cta_label, c.cta_url, c.image_url, c.extra_images || []]);
}

export function campaignVersion(c: LocalizedCampaign, language: string): LocalizedCampaign {
  if (language === c.language) return c;
  const v = c.translations?.[language as Language];
  if (c.translation_source !== contentSource(c) || !v?.subject?.trim() || !v.body?.trim()) {
    throw Object.assign(new Error(`Versione ${language.toUpperCase()} mancante o da aggiornare prima dell'invio.`), { status: 409 });
  }
  return { ...c, ...v, language };
}

export function languageCounts(recipients: { language: string }[]) {
  return recipients.reduce<Record<string, number>>((counts, r) => {
    counts[r.language] = (counts[r.language] || 0) + 1;
    return counts;
  }, {});
}