import { assertEquals, assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { selectRecipients, unsubscribeToken, encodeEmail, decodeEmail, renderNewsletter, NEWSLETTER_REPLY_TO } from './rules.ts';
import { recipientLanguage, contentSource, campaignVersion, languageCounts } from './localization.ts';

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

Deno.test('render includes extra photos, only https', () => {
  const { html } = renderNewsletter({ subject: 's', preheader: 'p', body: 'x', image_url: 'https://a/1.jpg', extra_images: ['https://a/2.jpg', 'http://bad/3.jpg'], cta_label: null, cta_url: null, language: 'it' }, 'https://u');
  assert(html.includes('https://a/2.jpg') && !html.includes('http://bad/3.jpg'));
});

Deno.test('+44 UK phone selects English even when country disagrees', () => {
  assertEquals(recipientLanguage('+44 20 7946 0958', 'Italia', 'it'), 'en');
});
Deno.test('0044 format selects English', () => assertEquals(recipientLanguage('0044 (20) 7946-0958'), 'en'));
Deno.test('+39 selects Italian', () => assertEquals(recipientLanguage('+39 350 928 6941', 'UK', 'en'), 'it'));
Deno.test('+33 selects French', () => assertEquals(recipientLanguage('+33 6 12 34 56 78'), 'fr'));
Deno.test('+49 selects German', () => assertEquals(recipientLanguage('+49 1512 3456789'), 'de'));
Deno.test('+34 selects Spanish', () => assertEquals(recipientLanguage('+34 612 345 678'), 'es'));
Deno.test('missing or incomplete number uses country, then draft language', () => {
  assertEquals(recipientLanguage('+44', 'France'), 'fr');
  assertEquals(recipientLanguage(null, 'UK'), 'en');
  assertEquals(recipientLanguage('02079460958', null, 'de'), 'de');
  assertEquals(recipientLanguage(null, null, 'es'), 'es');
});
Deno.test('unsupported or ambiguous region keeps draft language', () => {
  assertEquals(recipientLanguage('+41 79 123 45 67', 'France', 'it'), 'it');
});
Deno.test('selected recipients retain language without exposing phone', () => {
  const r = selectRecipients([{ id: 'uk', email: 'london@pizza.co.uk', phone: '+442079460958', country: null, status: 'nuovo' }], { stages: ['nuovo'], countries: [] }, new Set());
  assertEquals(r, [{ lead_id: 'uk', email: 'london@pizza.co.uk', language: 'en', recipient_name: null }]);
  assertEquals(languageCounts(r), { en: 1 });
});
Deno.test('delivery uses saved English text and original photos', () => {
  const c = { language: 'it', subject: 'Forno', preheader: 'Pronto', body: 'Forno disponibile', image_url: 'https://vesuvianoforni.com/photo.jpg', cta_label: 'Scopri', cta_url: 'https://vesuvianoforni.com/it/pronta-consegna', translations: { en: { subject: 'Oven', preheader: 'Ready', body: 'Oven available', cta_label: 'Discover', cta_url: 'https://vesuvianoforni.com/en/ready-to-ship' } }, translation_source: '' };
  c.translation_source = contentSource(c);
  const english = campaignVersion(c, 'en');
  assertEquals(english.body, 'Oven available');
  assertEquals(english.image_url, c.image_url);
  assertEquals(english.cta_url, 'https://vesuvianoforni.com/en/ready-to-ship');
  assertEquals(english.language, 'en');
  let blocked = false;
  try { campaignVersion({ ...c, body: 'Changed offer' }, 'en'); } catch { blocked = true; }
  assertEquals(blocked, true);
});
Deno.test('missing language blocks delivery instead of sending Italian to UK', () => {
  let blocked = false;
  try { campaignVersion({ language: 'it', subject: 'Forno', preheader: '', body: 'Disponibile', image_url: null, cta_label: null, cta_url: null }, 'en'); } catch { blocked = true; }
  assertEquals(blocked, true);
});
