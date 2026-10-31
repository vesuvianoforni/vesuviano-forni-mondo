import { assertEquals, assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { DEFAULT_OFFER_SETTINGS, newOfferDocument, offerTotals, canManageOffers, canManageOfferSettings, isPublicOfferAvailable, commercialOfferUrl } from './domain.ts';
import { BodySchema } from './schema.ts';
const doc = () => ({ ...newOfferDocument(DEFAULT_OFFER_SETTINGS), customer_name: 'Cliente', title: 'Forno', items: [{ id: crypto.randomUUID(), product_id: null, product_name: 'Forno', description: '', image_url: '', quantity: 2, unit_price: 1000, discount_percent: 10, notes: '' }] });
Deno.test('pagamento Vesuviano resta 50% acconto e 50% alla consegna', () => assertEquals(DEFAULT_OFFER_SETTINGS.payment_agreement, '50% acconto - 50% a consegna'));
Deno.test('conserva i tre conti aziendali del modello Zapper', () => {
  assertEquals(DEFAULT_OFFER_SETTINGS.companies.climatel.bank_iban, 'IT82 S030 6976 4511 0000 0003 441');
  assertEquals(DEFAULT_OFFER_SETTINGS.companies.unita1.bank_iban, 'IT12P0306976451100000003224');
  assertEquals(DEFAULT_OFFER_SETTINGS.companies.wise.bank_iban, 'GB61 TRWI 6084 6462 5318 58');
});
Deno.test('sconti di riga e IVA standard sono calcolati sul netto', () => assertEquals(offerTotals(doc()), { lines: [1800], subtotal: 1800, vat: 396, total: 2196 }));
for (const regime of ['reverse_charge','intra_ue','extra_ue','forfetario'] as const) Deno.test(`IVA ${regime} resta zero`, () => assertEquals(offerTotals({ ...doc(), vat_regime: regime }).vat, 0));
Deno.test('commerciali gestiscono offerte ma solo admin modifica impostazioni', () => {
  assert(canManageOffers(['commerciale'])); assert(canManageOffers(['admin'])); assertEquals(canManageOffers(['produzione']),false);
  assertEquals(canManageOfferSettings(['commerciale']), false); assert(canManageOfferSettings(['admin']));
});
Deno.test('condivisione esplicita e validità sono obbligatorie per la pagina pubblica', () => {
  const offer = { public_enabled: true, archived: false, document: { ...doc(), valid_until: '2026-10-31' } };
  assert(isPublicOfferAvailable(offer, '2026-10-31')); assertEquals(isPublicOfferAvailable(offer, '2026-11-01'), false);
  assertEquals(isPublicOfferAvailable({ ...offer, public_enabled: false }, '2026-10-31'),false);
  assertEquals(isPublicOfferAvailable({ ...offer, archived: true }, '2026-10-31'),false);
});
Deno.test('link offerta usa il dominio Vesuviano senza www', () => assertEquals(commercialOfferUrl('abc'), 'https://vesuvianoforni.com/offerta/abc'));
Deno.test('validazione rifiuta prezzi negativi sconti oltre 100 e date impossibili', () => {
  const input = { action: 'save', id: crypto.randomUUID(), lead_id: null, status: 'offerta_pronta', document: doc() };
  assert(BodySchema.safeParse(input).success);
  assertEquals(BodySchema.safeParse({ ...input, document: { ...input.document, items: [{ ...input.document.items[0], unit_price: -1 }] } }).success,false);
  assertEquals(BodySchema.safeParse({ ...input, document: { ...input.document, items: [{ ...input.document.items[0], discount_percent: 101 }] } }).success,false);
  assertEquals(BodySchema.safeParse({ ...input, document: { ...input.document, valid_until: '2026-02-31' } }).success,false);
});