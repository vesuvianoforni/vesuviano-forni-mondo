import { businessContactLinks } from '../_shared/mario/contact-pages.ts';

function equal(a: unknown, b: unknown) {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${JSON.stringify(a)} != ${JSON.stringify(b)}`);
}

Deno.test('contact page takes precedence over earlier about pages', () => {
  equal(businessContactLinks('https://pizza.co.uk/', [
    'https://pizza.co.uk/about', 'https://pizza.co.uk/about-us', 'https://pizza.co.uk/contact',
  ]), ['https://pizza.co.uk/contact', 'https://pizza.co.uk/about']);
});
Deno.test('only links on the official domain may be selected', () => {
  equal(businessContactLinks('https://pizza.co.uk/', [
    'https://other.co.uk/contact', 'https://127.0.0.1/contact', 'http://pizza.co.uk/contact',
    'javascript:alert(1)', '/contact',
  ]), ['https://pizza.co.uk/contact']);
});
Deno.test('self links and duplicate contact links do not consume a slot', () => {
  equal(businessContactLinks('https://pizza.co.uk/contact/', [
    '/contact/#top', '/about', '/about#team', '/about-us',
  ]), ['https://pizza.co.uk/about', 'https://pizza.co.uk/about-us']);
});
Deno.test('localized contact paths take precedence over company pages', () => {
  for (const path of ['contatti', 'kontakt', 'contacto', 'contactez-nous']) {
    equal(businessContactLinks('https://pizza.co.uk/', ['/a-propos', `/${path}`])[0], `https://pizza.co.uk/${path}`);
  }
});
Deno.test('link candidates stay bounded to two', () => {
  equal(businessContactLinks('https://pizza.co.uk/', ['/contact', '/contact-us', '/contatti', '/about']).length, 2);
});
Deno.test('no contact or company links means no additional scrape candidate', () => {
  equal(businessContactLinks('https://pizza.co.uk/', ['/menu', '/book', null, 12]), []);
  equal(businessContactLinks('https://pizza.co.uk/', null), []);
});