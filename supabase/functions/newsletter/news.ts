import { parseRssItems, selectNewsSources } from './news-policy.ts';
import type { EditorialTheme } from '../_shared/newsletter-themes.ts';

/** Free trade-press feeds plus Google News RSS; no paid credits. External text is evidence, never instructions. */
const TRADE_FEEDS = ['https://www.pmq.com/feed/'];
const googleNewsFeed = (query: string) => `https://news.google.com/rss/search?q=${encodeURIComponent(`${query.replace(/\bnews\b/gi, '').trim()} when:7d`)}&hl=en-US&gl=US&ceid=US:en`;

async function fetchFeed(url: string) {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'VesuvianoNewsletter/1.0 (+https://vesuvianoforni.com)', Accept: 'application/rss+xml, application/xml, text/xml' }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
    if (!response.ok) { console.warn('news feed failed', new URL(url).hostname, response.status); return []; }
    return parseRssItems((await response.text()).slice(0, 2_000_000));
  } catch (error) { console.warn('news feed error', new URL(url).hostname, error instanceof Error ? error.name : 'error'); return []; }
}

export async function researchNews(now = new Date(), theme?: EditorialTheme | null) {
  const query = theme?.query || 'pizza pizzeria restaurant industry';
  const batches = await Promise.all([googleNewsFeed(query), ...TRADE_FEEDS].map(fetchFeed));
  const rows = batches.flat().sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
  const sources = selectNewsSources(rows, now, theme);
  if (sources.length < 2) throw Object.assign(new Error(`Non ci sono abbastanza notizie recenti verificabili${theme ? ` per «${theme.labels.it}»` : ''}: bozza settimanale non creata.`), { status: 422 });
  return sources;
}
