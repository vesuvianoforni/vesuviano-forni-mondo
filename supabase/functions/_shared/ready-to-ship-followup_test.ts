import { assertEquals, assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { followupDueAt, followupText, isWorkingTime, nextWorkingSlot } from './ready-to-ship-followup.ts';

Deno.test('lun-sab 9-19 Roma: dentro orario parte dopo 2 minuti', () => {
  // Wed 4 Nov 2026 15:15 UTC = 16:15 Rome
  assertEquals(followupDueAt(new Date('2026-11-04T15:15:00Z')).toISOString(), '2026-11-04T15:17:00.000Z');
});

Deno.test('dopo le 19 slitta alle 9 del giorno dopo', () => {
  // Wed 18:55 UTC = 19:55 Rome -> Thu 9:00 Rome = 08:00 UTC
  assertEquals(nextWorkingSlot(new Date('2026-11-04T18:55:00Z')).toISOString(), '2026-11-05T08:00:00.000Z');
});

Deno.test('sabato è lavorativo, domenica no', () => {
  assert(isWorkingTime(new Date('2026-11-07T10:00:00Z'))); // Sat 11:00 Rome
  assert(!isWorkingTime(new Date('2026-11-08T10:00:00Z'))); // Sun
  // Sat 19:30 Rome -> Mon 9:00 Rome
  assertEquals(nextWorkingSlot(new Date('2026-11-07T18:30:00Z')).toISOString(), '2026-11-09T08:00:00.000Z');
});

Deno.test('testo in lingua cliente con link prenotazione', () => {
  const t = followupText('fr', 'Marc', 'Real Bosco', 'm@x.fr');
  assert(t.includes('Bonjour Marc') && t.includes('book-a-slot-call') && t.includes('m@x.fr'));
});
