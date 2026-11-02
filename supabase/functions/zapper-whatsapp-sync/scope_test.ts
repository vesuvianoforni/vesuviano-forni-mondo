import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { externalId, isGennaro, messageBody, phoneKey } from './scope.ts';

Deno.test('solo il numero WaSender di Gennaro viene importato', () => {
  assertEquals(isGennaro('+39 350 928 6941'), true);
  assertEquals(isGennaro('393509286941@s.whatsapp.net'), true);
  assertEquals(isGennaro('+39 324 899 6189'), false);
});

Deno.test('telefono cliente confrontato sulle ultime 9 cifre', () => {
  assertEquals(phoneKey('447700900123@s.whatsapp.net'), phoneKey('+44 7700 900123'));
  assertEquals(phoneKey('0039 333 1234567'), phoneKey('3331234567'));
});

Deno.test('media senza testo ha un testo leggibile e id stabile', () => {
  assertEquals(messageBody({ content: '', message_type: 'image' }), '📷 Immagine');
  assertEquals(externalId({ wasender_id: '3EB0ABC', id: 'x' }), 'zapper-wa:3EB0ABC');
  assertEquals(externalId({}), null);
});
