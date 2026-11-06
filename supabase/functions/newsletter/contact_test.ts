import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { NEWSLETTER_CONTACT, newsletterWhatsAppUrl } from './contact.ts';

Deno.test('newsletter WhatsApp targets the confirmed mobile, not the office landline', () => {
  const url = new URL(newsletterWhatsAppUrl());
  assertEquals(url.origin, 'https://wa.me');
  assertEquals(url.pathname, '/3908119231684');
  assertEquals(NEWSLETTER_CONTACT.whatsapp, '+39 081 1923 1684');
});

Deno.test('newsletter signature identifies Gennaro as Sales & Export Manager', () => {
  assertEquals(NEWSLETTER_CONTACT.name, 'Gennaro Caglione');
  assertEquals(NEWSLETTER_CONTACT.role, 'Sales & Export Manager');
});