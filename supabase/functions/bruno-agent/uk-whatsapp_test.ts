import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { inCustomerWindow, renderTemplate } from './uk-whatsapp.ts';
Deno.test('UK testo libero solo entro 24h sulla linea del cliente', () => {
  const now = Date.parse('2026-11-09T18:00:00Z');
  assertEquals(inCustomerWindow('2026-11-08T18:00:00Z', now), false);
  assertEquals(inCustomerWindow('2026-11-08T18:00:01Z', now), true);
  assertEquals(inCustomerWindow(null, now), false);
});
Deno.test('Il corpo proposto corrisponde alle variabili reali del template', () => {
  assertEquals(renderTemplate('Hello {{1}}, your oven is {{2}}.', ['Mark', 'Ottavio']), 'Hello Mark, your oven is Ottavio.');
});