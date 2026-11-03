import { publicWebsite } from './policy.ts';

const CONTACT_PATH = /contact|contatt|kontakt|contacto/i;
const ABOUT_PATH = /about|propos/i;

// Return candidates in contact-first order; enrichment still makes one extra scrape.
export function businessContactLinks(website: string, values: unknown): string[] {
  const site = publicWebsite(website);
  const normalize = (value: string) => {
    const url = new URL(value);
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  };
  const seen = new Set([normalize(site.url)]);
  const candidates: { url: string; priority: number }[] = [];
  if (!Array.isArray(values)) return [];
  for (const value of values) {
    if (typeof value !== 'string') continue;
    try {
      const linked = publicWebsite(new URL(value, site.url).toString());
      const path = new URL(linked.url).pathname;
      const contact = CONTACT_PATH.test(path);
      if (linked.domain !== site.domain || (!contact && !ABOUT_PATH.test(path))) continue;
      const key = normalize(linked.url);
      if (seen.has(key)) continue;
      seen.add(key);
      candidates.push({ url: key, priority: contact ? 0 : 1 });
    } catch { /* Ignore unsafe or malformed links supplied by the page. */ }
  }
  return candidates.sort((a, b) => a.priority - b.priority).slice(0, 2).map(c => c.url);
}