import { assertEquals, assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { selectRecipients, unsubscribeToken, encodeEmail, decodeEmail, renderNewsletter, NEWSLETTER_REPLY_TO } from './rules.ts';

const leads = [
  { id: '1', email: 'Mario@Pizza.it', status: 'qualificato', country: 'Italia' },
  { id: '2', email: 'mario@pizza.it', status: 'nuovo', country: 'Italia' },
  { id: '3', email: 'lost@x.com', status: 'perso', country: 'Italia' },
  { id: '4', email: 'bye@x.com', status: 'nuovo', country: 'UK' },
  { id: '5', email: 'not-an-email', status: 'nuovo', country: 'UK' },
  { id: '6', email: 'uk@x.com', status: 'nuovo', country: 'UK' },
];

Deno.test('reply-to is info@', () => assertEquals(NEWSLETTER_REPLY_TO, 'info@vesuvianoforni.com'));

Deno.test('dedupes, skips lost, invalid and unsubscribed', () => {
  const r = selectRecipients(leads, { stages: ['nuovo', 'qualificato', 'perso'], countries: [] }, new Set(['bye@x.com']));
  assertEquals(r.map((x) => x.email), ['mario@pizza.it', 'uk@x.com']);
});

Deno.test('filters by country', () => {
  const r = selectRecipients(leads, { stages: ['nuovo'], countries: ['uk'] }, new Set());
  assertEquals(r.map((x) => x.email), ['bye@x.com', 'uk@x.com']);
});

Deno.test('unsubscribe token is stable and email roundtrips', async () => {
  assertEquals(await unsubscribeToken('A@b.it', 's'), await unsubscribeToken('a@b.it', 's'));
  assertEquals(decodeEmail(encodeEmail('a@b.it')), 'a@b.it');
});

Deno.test('render includes unsubscribe link and escapes body', () => {
  const { html } = renderNewsletter({ subject: 's', preheader: 'p', body: '<b>hi</b>', image_url: null, cta_label: 'Go', cta_url: 'https://vesuvianoforni.com', language: 'en' }, 'https://u.test/x');
  assert(html.includes('https://u.test/x') && html.includes('Unsubscribe') && html.includes('&lt;b&gt;'));
});
