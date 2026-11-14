import { selectNewsSources } from './news-policy.ts';
import type { EditorialTheme } from '../_shared/newsletter-themes.ts';

/** One bounded weekly search; external text is evidence, never instructions. */
export async function researchNews(now = new Date(), theme?: EditorialTheme | null) {
  const key = Deno.env.get('FIRECRAWL_API_KEY');
  if (!key) throw Object.assign(new Error('Ricerca notizie non configurata.'), { status: 503 });
  const response = await fetch('https://api.firecrawl.dev/v2/search', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(60000),
    body: JSON.stringify({ query: theme?.query || 'pizza pizzeria restaurant industry news', sources: [{ type: 'news' }], tbs: 'qdr:w', limit: 6, scrapeOptions: { formats: ['markdown'] } }),
  });
  const payload = await response.json();
  if (!response.ok || payload.success === false) throw Object.assign(new Error(typeof payload.error === 'string' ? payload.error : `Ricerca notizie non completata (${response.status}).`), { status: response.ok ? 502 : response.status });
  const sources = selectNewsSources(payload.data?.news || [], now, theme);
  if (sources.length < 2) throw Object.assign(new Error(`Non ci sono abbastanza notizie recenti verificabili${theme ? ` per «${theme.labels.it}»` : ''}: bozza settimanale non creata.`), { status: 422 });
  return sources;
}