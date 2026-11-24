import type { EditorialTheme } from '../_shared/newsletter-themes.ts';

export type NewsSource = { id: string; title: string; url: string; publisher: string; published_at: string; excerpt: string; image_url?: string };
export type NewsReference = Omit<NewsSource, 'excerpt'>;
export const NEWS_WINDOW_DAYS = 7;

export function newsPublicationDate(raw: string, now: Date): Date | null {
  const relative = raw.trim().match(/^(\d+)\s+(minute|hour|day|week)s?\s+ago$/i);
  if (relative) {
    const units: Record<string, number> = { minute: 60000, hour: 3600000, day: 86400000, week: 604800000 };
    return new Date(now.getTime() - Number(relative[1]) * (units[relative[2].toLowerCase()] || 0));
  }
  const value = new Date(raw);
  return Number.isNaN(value.getTime()) ? null : value;
}

export function selectNewsSources(rows: { title?: string; url?: string; date?: string; snippet?: string; markdown?: string; publisher?: string; image?: string }[], now = new Date(), theme?: EditorialTheme | null): NewsSource[] {
  const seen = new Set<string>();
  const selected: NewsSource[] = [];
  for (const row of rows) {
    const published = newsPublicationDate(row.date || '', now);
    if (!published || published > now || now.getTime() - published.getTime() > NEWS_WINDOW_DAYS * 86400000) continue;
    let url: URL;
    try { url = new URL(row.url || ''); } catch { continue; }
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.') || /^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(url.hostname)) continue;
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) if (key.startsWith('utm_')) url.searchParams.delete(key);
    const href = url.toString();
    const excerpt = (row.markdown || row.snippet || '').trim();
    if (!row.title?.trim() || !excerpt || seen.has(href)) continue;
    if (theme && !theme.relevance.test(`${row.title} ${row.snippet || excerpt.slice(0, 500)}`)) continue;
    seen.add(href);
    selected.push({ id: `N${selected.length + 1}`, title: row.title.trim().slice(0, 240), url: href, publisher: (row.publisher?.trim() || url.hostname.replace(/^www\./, '')).slice(0, 120), published_at: published.toISOString(), excerpt: excerpt.slice(0, 6000), ...(safeImageUrl(row.image) ? { image_url: safeImageUrl(row.image) } : {}) });
    if (selected.length === 6) break;
  }
  return selected;
}

/** Publisher-supplied feed photo only: https, public host, no tracking pixels. */
export function safeImageUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== 'https:' || u.username || u.password || !u.hostname.includes('.') || /^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname)) return undefined;
    if (/news\.google\.com|googleusercontent|gravatar|pixel|1x1|spacer|feeds\.feedburner/i.test(u.href)) return undefined;
    return u.href.slice(0, 1000);
  } catch { return undefined; }
}

export function selectedReferences(ids: string[], sources: NewsSource[]): NewsReference[] {
  const unique = [...new Set(ids)];
  if (unique.length < 2 || unique.length > 4 || unique.some((id) => !sources.some((s) => s.id === id))) {
    throw Object.assign(new Error('Notizie insufficienti o fonti non verificate: nessuna newsletter è stata inviata.'), { status: 422 });
  }
  return unique.map((id) => {
    const source = sources.find((s) => s.id === id);
    if (!source) throw new Error('Fonte non verificata');
    const { excerpt: _excerpt, ...reference } = source;
    return reference;
  });
}

const LABELS: Record<string, string> = { it: 'Fonti delle notizie', en: 'News sources', fr: 'Sources des actualités', de: 'Nachrichtenquellen', es: 'Fuentes de las noticias' };
export const newsSourcesLabel = (language: string) => LABELS[language] || LABELS.it;
const decodeXml = (v: string) => v.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n))).replace(/&amp;/g, '&');
const stripTags = (v: string) => decodeXml(v).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

/** Parses RSS 2.0 items (Google News and trade-press feeds); text is evidence only. */
export function parseRssItems(xml: string) {
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].slice(0, 60).map(([item]) => {
    const tag = (name: string) => item.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1] || '';
    const source = stripTags(tag('source'));
    let title = stripTags(tag('title'));
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -source.length - 3).trim();
    const snippet = stripTags(tag('description')).slice(0, 1500);
    const attr = (re: RegExp) => decodeXml(item.match(re)?.[1] || '');
    const image = attr(/<media:content\b[^>]*\burl="([^"]+)"[^>]*(?:medium="image"|type="image\/)/i) || attr(/<media:content\b[^>]*(?:medium="image"|type="image\/)[^>]*\burl="([^"]+)"/i)
      || attr(/<media:thumbnail\b[^>]*\burl="([^"]+)"/i) || attr(/<enclosure\b[^>]*\burl="([^"]+)"[^>]*type="image\//i) || attr(/<enclosure\b[^>]*type="image\/[^"]*"[^>]*\burl="([^"]+)"/i)
      || (decodeXml(tag('content:encoded') || tag('description')).match(/<img\b[^>]*\bsrc="([^"]+)"/i)?.[1] || '');
    return { image: image || undefined, title, url: decodeXml(tag('link')).trim(), date: stripTags(tag('pubDate')), snippet: snippet && snippet !== title ? snippet : title, publisher: source || undefined };
  });
}
