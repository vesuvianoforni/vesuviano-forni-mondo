import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { requestsPrices, catalogWithoutPrices, enforcePricePolicy, scheduledBrief } from './policy.ts';

Deno.test('ordinary brief does not authorize prices', () => assertEquals(requestsPrices('Promuovi il Real Bosco 120 per Natale'), false));
Deno.test('direct request explicitly authorizes prices', () => assertEquals(requestsPrices('Inserisci il prezzo del forno in pronta consegna'), true));
Deno.test('request to omit prices does not authorize them', () => {
  assertEquals(requestsPrices('Non inserire mai i prezzi'), false);
  assertEquals(requestsPrices('Newsletter sul forno senza prezzi'), false);
});
Deno.test('non-requested prices are rejected in each generated field', () => {
  for (const field of ['title','subject','preheader','body','cta_label']) {
    assertThrows(() => enforcePricePolicy({ [field]: 'Forno a 6.600 €' }, false));
  }
});
Deno.test('explicitly requested price is preserved', () => enforcePricePolicy({ body: 'Forno a 6.600 €' }, true));
Deno.test('dimensions and payment percentages are not prices', () => enforcePricePolicy({ body: 'Real Bosco 120: 1.500 kg, canna fumaria 200 mm, 50% acconto e 50% alla consegna' }, false));
Deno.test('catalog excludes monetary data while preserving real photos and measurements', () => {
  assertEquals<unknown>(catalogWithoutPrices({ pronta: [{ diametro: 120, prezzo_offerta: 6600, list_price: 7700, consegna: '300 € trasporto', foto: ['https://vesuvianoforni.com/realbosco.jpg'] }] }),
    { pronta: [{ diametro: 120, consegna: '[importo omesso] trasporto', foto: ['https://vesuvianoforni.com/realbosco.jpg'] }] });
});
Deno.test('special occasion brief uses occasion context without authorizing prices', () => {
  const brief = scheduledBrief('occasion-2026-christmas', '10 ottobre 2026', []);
  assertEquals(requestsPrices(brief), false);
  assertThrows(() => scheduledBrief('occasion-2026-madeup', '10 ottobre 2026', []));
});