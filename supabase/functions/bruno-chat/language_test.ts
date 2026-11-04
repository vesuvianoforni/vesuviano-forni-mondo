import { assertEquals } from 'jsr:@std/assert';
import { customerLanguage } from './language.ts';
Deno.test('prefissi', () => {
  assertEquals(customerLanguage({ phone: '+33 6 12' }), 'fr');
  assertEquals(customerLanguage({ phone: '0049 170' }), 'de');
  assertEquals(customerLanguage({ phone: '+44 7700' }), 'en');
  assertEquals(customerLanguage({ phone: '3383156161' }), 'it');
  assertEquals(customerLanguage({ phone: '+31 6' }), 'en');
  assertEquals(customerLanguage({ country: 'Spagna' }), 'es');
});
