import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { linkedMaterialNames, materialSearchText } from './materials.ts';

Deno.test('Bruno trova foto video e schede dal nome di ogni prodotto collegato', () => {
  for (const kind of ['foto', 'video', 'scheda']) {
    const material = { kind, title: 'Materiale condiviso', products: { name: 'Anastasia' }, product_asset_links: [{ products: { name: 'Anastasia' } }, { products: { name: 'Real Bosco', category: 'forno' } }] };
    assertEquals(materialSearchText(material).includes('real bosco'), true);
    assertEquals(materialSearchText(material).includes('anastasia'), true);
    assertEquals(linkedMaterialNames(material), ['Anastasia', 'Real Bosco']);
  }
});
Deno.test('Bruno mantiene materiali aziendali e collegamenti legacy', () => {
  assertEquals(linkedMaterialNames({ title: 'Laboratorio' }), []);
  assertEquals(linkedMaterialNames({ products: { name: 'Ottavio' } }), ['Ottavio']);
});