// Centralized hreflang map: each cluster lists the canonical path per language.
// Mirrors scripts/generate-sitemap.ts staticPages so HTML hreflang matches sitemap.

export type Lang = 'it' | 'en' | 'fr' | 'de' | 'es';
export const LANGS: Lang[] = ['it', 'en', 'fr', 'de', 'es'];

export type AlternatesMap = Record<Lang, string>;

const CLUSTERS: AlternatesMap[] = [
  // Homepages
  { it: '/it', en: '/en', fr: '/fr', de: '/de', es: '/es' },
  // Product pages
  { it: '/it/forni-tradizionali', en: '/en/traditional-ovens', fr: '/fr/fours-traditionnels', de: '/de/traditionelle-oefen', es: '/es/hornos-tradicionales' },
  { it: '/it/forni-gas', en: '/en/gas-ovens', fr: '/fr/fours-gaz', de: '/de/gasoefen', es: '/es/hornos-gas' },
  { it: '/it/forni-elettrici', en: '/en/electric-ovens', fr: '/fr/fours-electriques', de: '/de/elektrooefen', es: '/es/hornos-electricos' },
  { it: '/it/forni-rotanti', en: '/en/rotating-ovens', fr: '/fr/fours-rotatifs', de: '/de/drehoefen', es: '/es/hornos-rotativos' },
  { it: '/it/sistema-vesuviobuono', en: '/en/vesuviobuono-system', fr: '/fr/systeme-vesuviobuono', de: '/de/vesuviobuono-system', es: '/es/sistema-vesuviobuono' },
  // Secondary
  { it: '/it/pronta-consegna', en: '/en/ready-to-ship', fr: '/fr/pret-a-expedier', de: '/de/sofort-lieferbar', es: '/es/listo-para-enviar' },
  { it: '/it/architettoai', en: '/en/architettoai', fr: '/fr/architettoai', de: '/de/architettoai', es: '/es/architettoai' },
  { it: '/it/blog', en: '/en/blog', fr: '/fr/blog', de: '/de/blog', es: '/es/blog' },
  { it: '/it/bruciatori', en: '/en/burners', fr: '/fr/bruleurs', de: '/de/brenner', es: '/es/quemadores' },
  { it: '/it/depuratore-fumi', en: '/en/wood-smoke-purifier', fr: '/fr/purificateur-fumee', de: '/de/rauchfilter', es: '/es/purificador-humo' },
  { it: '/it/collezioni', en: '/en/collections', fr: '/fr/collections', de: '/de/kollektionen', es: '/es/colecciones' },
  { it: '/it/chi-siamo', en: '/en/about-us', fr: '/fr/qui-sommes-nous', de: '/de/ueber-uns', es: '/es/quienes-somos' },
  { it: '/it/servizi', en: '/en/services', fr: '/fr/services', de: '/de/dienstleistungen', es: '/es/servicios' },
  { it: '/it/informazioni-utili', en: '/en/useful-information', fr: '/fr/informations-utiles', de: '/de/nuetzliche-informationen', es: '/es/informacion-util' },
  // Neapolitan pizza ovens — no IT variant; IT alternate falls back to EN
  { it: '/en/neapolitan-pizza-ovens', en: '/en/neapolitan-pizza-ovens', fr: '/fr/fours-a-pizza-napolitains', de: '/de/neapolitanische-pizzaoefen', es: '/es/hornos-pizza-napolitana' },
];

// Build reverse index: path -> cluster
const PATH_TO_CLUSTER = new Map<string, AlternatesMap>();
for (const cluster of CLUSTERS) {
  for (const lang of LANGS) {
    PATH_TO_CLUSTER.set(cluster[lang], cluster);
  }
}

/** Normalize: drop trailing slash (except root), strip query/hash. */
function normalize(path: string): string {
  const clean = path.split('?')[0].split('#')[0];
  if (clean.length > 1 && clean.endsWith('/')) return clean.slice(0, -1);
  return clean;
}

/** Returns the alternates map for a known cluster path, or null. */
export function getAlternatesForPath(path: string): AlternatesMap | null {
  return PATH_TO_CLUSTER.get(normalize(path)) ?? null;
}
