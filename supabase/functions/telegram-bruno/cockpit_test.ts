import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { dueSummary, priority, directCallLabel, communicationUrl, telegramCallSummary } from './cockpit.ts';

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
Deno.test('Esiti umani non confondono fine squillo con risposta', () => {
  assertEquals(directCallLabel('ended', false), 'Tentativo concluso senza risposta registrata');
  assertEquals(directCallLabel('ended', true), 'Chiamata conclusa');
  assertEquals(directCallLabel('unknown', true), 'Esito da verificare');
});
Deno.test('Un messaggio email apre Mail e un UK apre la Chat UK', () => {
  assertEquals(communicationUrl('lead', 'email'), 'https://vesuvianoforni.com/erp/mail?lead=lead');
  assertEquals(communicationUrl('lead', 'whatsapp_uk'), 'https://vesuvianoforni.com/erp/chat?lead=lead&platform=whatsapp_uk');
});
Deno.test('Telegram proietta solo il riepilogo reale, mai audio o trascrizione', () => {
  const call = { summary: 'Cliente interessato a Ottavio gas.', recording_status: 'ready', transcript: 'Testo privato della conversazione', audioUrl: 'https://private/audio' };
  const body = telegramCallSummary(call);
  assertEquals(body, '<b>Riepilogo</b>\nCliente interessato a Ottavio gas.');
  assertEquals(body.includes(call.transcript), false); assertEquals(body.includes(call.audioUrl), false);
  assertEquals(telegramCallSummary({ recording_status: 'pending' }), '<i>Riepilogo in preparazione.</i>');
});
