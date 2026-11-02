import { assertEquals, assertThrows } from 'jsr:@std/assert@1';
import { autoEligibility, dailyNewStarts, nextTerritory, warmupLimit, TERRITORIES } from '../_shared/mario/autopilot-policy.ts';
import { deliveryLimits, deliveryBlock } from '../_shared/mario/delivery-policy.ts';

const base = { qualified: true, email: 'info@pizza.es', domain: 'pizza.es', country: 'ES', status: 'new', recipient_eligibility: 'unreviewed', replied_at: null };

Deno.test('tetto massimo 200 email al giorno', () => {
  deliveryLimits(200, 180);
  assertThrows(() => deliveryLimits(201, 180));
});
Deno.test('warm-up: 40 la prima settimana, 200 dalla quinta', () => {
  const now = new Date('2026-12-01T10:00:00Z');
  assertEquals(warmupLimit('2026-11-30T10:00:00Z', 200, now), 40);
  assertEquals(warmupLimit('2026-11-20T10:00:00Z', 200, now), 80);
  assertEquals(warmupLimit('2026-10-01T10:00:00Z', 200, now), 200);
  assertEquals(warmupLimit(null, 200, now), 0);
});
Deno.test('nuove sequenze al giorno = tetto / 3 (avvio + 2 follow-up)', () => assertEquals(dailyNewStarts(200), 66));
Deno.test('Italia mai presente nella rotazione', () => assertEquals(TERRITORIES.some(t => (t.country as string) === 'IT'), false));
Deno.test('rotazione salta paesi non abilitati', () => assertEquals(nextTerritory(0, ['FR']).country, 'FR'));
Deno.test('Germania e Italia non inviano mai email', () => {
  assertEquals(autoEligibility({ ...base, country: 'DE', email: 'a@b.de', domain: 'b.de' }), 'blocked');
  assertEquals(typeof deliveryBlock({ ...base, country: 'IT' }), 'string');
});
Deno.test('Spagna con email sul dominio ufficiale è idonea', () => assertEquals(autoEligibility(base), 'eligible'));
Deno.test('email gratuite o di altro dominio non idonee', () => {
  assertEquals(autoEligibility({ ...base, email: 'pizza@gmail.com' }), 'blocked');
  assertEquals(autoEligibility({ ...base, email: 'info@altro.es' }), 'blocked');
});
