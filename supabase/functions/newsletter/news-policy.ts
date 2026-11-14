export type NewsSource = { id: string; title: string; url: string; publisher: string; published_at: string; excerpt: string };
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

export function selectNewsSources(rows: { title?: string; url?: string; date?: string; snippet?: string; markdown?: string }[], now = new Date()): NewsSource[] {
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
    seen.add(href);
    selected.push({ id: `N${selected.length + 1}`, title: row.title.trim().slice(0, 240), url: href, publisher: url.hostname.replace(/^www\./, ''), published_at: published.toISOString(), excerpt: excerpt.slice(0, 6000) });
    if (selected.length === 6) break;
  }
  return selected;
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