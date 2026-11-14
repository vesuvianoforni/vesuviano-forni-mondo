import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { NEWSLETTER_THEMES, weeklyEditorialTheme, editorialCalendar, nextEditorialTheme } from '../_shared/newsletter-themes.ts';
import { selectNewsSources } from './news-policy.ts';
import { contentSource, campaignVersion } from './localization.ts';

Deno.test('four editorial themes include food ingredients and technology', () => {
  assertEquals(NEWSLETTER_THEMES.length, 4);
  assertEquals(NEWSLETTER_THEMES.map((theme) => theme.id), ['ingredients', 'technology', 'management', 'trends']);
});
Deno.test('themes change every seven days and repeat after four weeks without a monthly reset', () => {
  assertEquals(['2026-11-21', '2026-11-28', '2026-12-05', '2026-12-12', '2026-12-19'].map((date) => weeklyEditorialTheme(`news-${date}`)?.id), ['ingredients', 'technology', 'management', 'trends', 'ingredients']);
  assertEquals(weeklyEditorialTheme('news-2027-01-02')?.id, 'management');
});
Deno.test('manual campaigns, occasions, existing draft and invalid periods do not enter the rotation', () => {
  for (const key of ['manual-123', 'occasion-2026-pizza', '2026-11-A', 'news-2026-11-14', 'news-2026-11-22', 'news-2026-02-30', 'news-invalid']) assertEquals(weeklyEditorialTheme(key), null);
});
Deno.test('retrying a weekly job preserves its theme regardless of later periods', () => {
  assertEquals(weeklyEditorialTheme('news-2026-11-28')?.id, 'technology');
  weeklyEditorialTheme('news-2027-01-02');
  assertEquals(weeklyEditorialTheme('news-2026-11-28')?.id, 'technology');
  assertEquals(nextEditorialTheme(NEWSLETTER_THEMES[3]).id, 'ingredients');
});
Deno.test('calendar uses Rome dates and does not reset the cycle on a year boundary', () => {
  assertEquals(editorialCalendar(new Date('2026-11-14T09:39:00Z')).map((row) => row.date), ['2026-11-21', '2026-11-28', '2026-12-05', '2026-12-12']);
  assertEquals(editorialCalendar(new Date('2027-01-01T23:30:00Z'))[0]?.theme.id, 'management');
});
Deno.test('the ingredients topic filters out unrelated restaurant news instead of filling a themed draft', () => {
  const now = new Date('2026-11-14T09:39:00Z');
  const rows = [
    { title: 'New flour for pizza dough', url: 'https://pmq.com/flour', date: '2 days ago', snippet: 'Wheat sourcing development.' },
    { title: 'Pizza robot unveiled', url: 'https://pmq.com/robot', date: '2 days ago', snippet: 'Restaurant automation technology.' },
  ];
  assertEquals(selectNewsSources(rows, now, NEWSLETTER_THEMES[0]).map((source) => source.url), ['https://pmq.com/flour']);
  assertEquals(selectNewsSources(rows, now, NEWSLETTER_THEMES[1]).map((source) => source.url), ['https://pmq.com/robot']);
});
Deno.test('changing a persisted editorial theme invalidates existing translations before approval', () => {
  const c = { language: 'it', editorial_theme: 'ingredients', subject: 'Notizia', preheader: '', body: 'Fatto', cta_label: null, cta_url: null, image_url: null, translations: { en: { subject: 'News', preheader: '', body: 'Fact', cta_label: null, cta_url: null } }, translation_source: '' };
  c.translation_source = contentSource(c);
  assertEquals(campaignVersion(c, 'en').editorial_theme, 'ingredients');
  let blocked = false;
  try { campaignVersion({ ...c, editorial_theme: 'technology' }, 'en'); } catch { blocked = true; }
  assertEquals(blocked, true);
});