import { assertEquals, assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { newsletterRecipientName, newsletterGreeting, newsletterBody } from './personalization.ts';
import { renderNewsletter, selectRecipients, type Campaign } from './rules.ts';

const campaign: Campaign = { subject: 'Forni artigianali', preheader: 'Novità', body: 'Un forno per la tua pizzeria.', image_url: null, cta_label: null, cta_url: null, language: 'it' };

Deno.test('saluto usa il nome registrato del lead', () => {
  assertEquals(newsletterGreeting('it', 'Mario'), 'Ciao Mario,');
});
Deno.test('saluto conserva nome e cognome senza indovinarne la struttura', () => {
  assertEquals(newsletterGreeting('it', '  María   De la Cruz '), 'Ciao María De la Cruz,');
});
Deno.test('nome mancante usa un saluto neutro in ciascuna lingua', () => {
  assertEquals(['it', 'en', 'fr', 'de', 'es'].map((l) => newsletterGreeting(l)), ['Ciao,', 'Hello,', 'Bonjour,', 'Guten Tag,', 'Hola,']);
});
Deno.test('nome non valido non viene inventato da email o segnaposto', () => {
  for (const name of ['N/A', 'Sconosciuto', 'test', '123456', 'cliente@pizzeria.it', '<img src=x>', '{{nome}}']) assertEquals(newsletterRecipientName(name), null);
});
Deno.test('normalizza il nome senza inserire nuove righe', () => {
  assertEquals(newsletterRecipientName('Mario\r\nRossi'), 'Mario Rossi');
});
Deno.test('ogni destinatario mantiene il proprio nome nel pubblico deduplicato', () => {
  const recipients = selectRecipients([
    { id: 'mario', email: 'Mario@pizza.it', contact_name: 'Mario Rossi', status: 'nuovo', country: 'Italia' },
    { id: 'duplicate', email: 'mario@pizza.it', contact_name: 'Altro contatto', status: 'nuovo', country: 'Italia' },
    { id: 'emma', email: 'emma@pizza.co.uk', contact_name: 'Emma Smith', status: 'nuovo', country: 'UK' },
  ], { stages: ['nuovo'], countries: [] }, new Set());
  assertEquals(recipients.map((r) => [r.email, r.recipient_name, r.language]), [['mario@pizza.it', 'Mario Rossi', 'it'], ['emma@pizza.co.uk', 'Emma Smith', 'en']]);
});
Deno.test('HTML e testo semplice personalizzano senza modificare contenuto e firma', () => {
  const result = renderNewsletter(campaign, 'https://u.invalid', 'Mario D’Amico & Rossi');
  assert(result.html.includes('Ciao Mario D’Amico &amp; Rossi,'));
  assertEquals(result.text.split('\n\n').slice(0, 2), ['Ciao Mario D’Amico & Rossi,', campaign.body]);
  assert(result.text.includes('Gennaro Caglione\nSales & Export Manager'));
});
Deno.test('destinatari distinti ricevono nomi distinti nella lingua assegnata', () => {
  const mario = renderNewsletter(campaign, 'https://u.invalid', 'Mario Rossi');
  const emma = renderNewsletter({ ...campaign, language: 'en' }, 'https://u.invalid', 'Emma Smith');
  assertEquals(mario.text.split('\n')[0], 'Ciao Mario Rossi,');
  assertEquals(emma.text.split('\n')[0], 'Hello Emma Smith,');
  assert(!emma.text.includes('Mario Rossi') && !mario.text.includes('Emma Smith'));
});
Deno.test('vecchi saluti sono sostituiti anziché duplicati', () => {
  assertEquals(renderNewsletter({ ...campaign, body: 'Ciao a tutti,\n\nNovità dai laboratori.' }, 'https://u.invalid', 'Mario').text.split('\n\n').slice(0, 2), ['Ciao Mario,', 'Novità dai laboratori.']);
  assertEquals(newsletterBody('Hello,\nA new oven.'), 'A new oven.');
  assertEquals(newsletterBody('Bonjour Jean,\n\nNouveautés.'), 'Nouveautés.');
});
Deno.test('il testo del contenuto non viene rimosso come saluto', () => {
  assertEquals(newsletterBody('Ciao significa accoglienza: il forno racconta la tua pizzeria.'), 'Ciao significa accoglienza: il forno racconta la tua pizzeria.');
});