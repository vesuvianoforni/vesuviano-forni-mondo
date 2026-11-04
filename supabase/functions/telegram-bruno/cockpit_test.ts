import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { dueSummary, priority } from './cockpit.ts';

Deno.test('briefing alle 8 e chiusura alle 20 ora di Roma, solo feriali', () => {
  assertEquals(dueSummary(new Date('2026-11-04T07:10:00Z')), 'mattina'); // mer 8:10 Roma
  assertEquals(dueSummary(new Date('2026-11-04T19:05:00Z')), 'sera'); // mer 20:05 Roma
  assertEquals(dueSummary(new Date('2026-11-04T08:10:00Z')), null); // mer 9:10 Roma: nessun riepilogo
  assertEquals(dueSummary(new Date('2026-11-07T07:10:00Z')), null); // sabato
  assertEquals(dueSummary(new Date('2026-07-01T06:10:00Z')), 'mattina'); // ora legale
});

Deno.test('priorità alta per trattativa e nuovi lead', () => {
  assertEquals(priority('trattativa', 'message'), 'alta');
  assertEquals(priority('nuovo', 'lead'), 'alta');
  assertEquals(priority('qualificato', 'message'), 'normale');
  assertEquals(priority('perso', 'message'), 'bassa');
});
