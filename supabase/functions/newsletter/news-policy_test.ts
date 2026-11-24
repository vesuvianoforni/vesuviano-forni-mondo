import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { newsPublicationDate, selectNewsSources, selectedReferences } from './news-policy.ts';
const now = new Date('2026-11-14T09:25:00Z');
const row = { title: 'Pizza industry news', url: 'https://www.pmq.com/news', date: '2 days ago', snippet: 'A reported industry development.' };
Deno.test('weekly food news includes only the last seven days, not future or undated news', () => {
  const selected = selectNewsSources([row, { ...row, url: 'https://pmq.com/old', date: '8 days ago' }, { ...row, url: 'https://pmq.com/future', date: '2026-11-15' }, { ...row, url: 'https://pmq.com/unknown', date: '' }], now);
  assertEquals(selected.length, 1);
  assertEquals(selected[0]?.published_at, '2026-11-12T09:25:00.000Z');
  assertEquals(newsPublicationDate('1 week ago', now)?.toISOString(), '2026-11-07T09:25:00.000Z');
});
Deno.test('news sources exclude duplicate, unsafe and empty evidence', () => {
  assertEquals(selectNewsSources([row, { ...row, url: row.url + '?utm_source=mail#section' }, { ...row, url: 'http://pmq.com/news' }, { ...row, url: 'https://127.0.0.1/news' }, { ...row, url: 'https://pmq.com/empty', snippet: '' }], now).length, 1);
});
Deno.test('generated news can cite only verified sources and retains their original dates and URLs', () => {
  const sources = selectNewsSources([row, { ...row, url: 'https://ktla.com/pizza', date: '3 days ago' }], now);
  const refs = selectedReferences(['N2', 'N1'], sources);
  assertEquals(refs.map((r) => r.url), ['https://ktla.com/pizza', row.url]);
  assertEquals(refs[0]?.published_at, '2026-11-11T09:25:00.000Z');
  assertThrows(() => selectedReferences(['N1', 'invented'], sources));
  assertThrows(() => selectedReferences(['N1', 'N1'], sources));
});
Deno.test('parseRssItems reads Google News items with source and entities', async () => {
  const { parseRssItems } = await import('./news-policy.ts');
  const [item] = parseRssItems(`<rss><channel><item><title>Flour prices rise&#8217;s - PMQ</title><link>https://news.google.com/a</link><pubDate>Mon, 23 Nov 2026 10:00:00 GMT</pubDate><description>&lt;a&gt;Flour prices&lt;/a&gt;</description><source url="https://pmq.com">PMQ</source></item></channel></rss>`);
  if (item?.title !== 'Flour prices rise’s' || item.publisher !== 'PMQ' || item.url !== 'https://news.google.com/a') throw new Error(JSON.stringify(item));
});
