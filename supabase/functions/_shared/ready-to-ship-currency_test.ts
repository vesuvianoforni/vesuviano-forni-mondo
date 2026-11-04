import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts'
import { convertEur, currencyForPhone } from './ready-to-ship-currency.ts'

Deno.test('UK phone gets GBP', () => assertEquals(currencyForPhone('+44 7700 900123'), 'GBP'))
Deno.test('Swiss phone gets CHF', () => assertEquals(currencyForPhone('0041 79 123 4567'), 'CHF'))
Deno.test('US phone gets USD', () => assertEquals(currencyForPhone('+1 212 555 0100'), 'USD'))
Deno.test('French phone stays EUR', () => assertEquals(currencyForPhone('+33 6 12 34 56 78'), 'EUR'))
Deno.test('Italian local number stays EUR', () => assertEquals(currencyForPhone('3383156161'), 'EUR'))
Deno.test('6800 EUR at 0.8346 is 5675 GBP', () => assertEquals(convertEur(6800, 0.8346), 5675))
