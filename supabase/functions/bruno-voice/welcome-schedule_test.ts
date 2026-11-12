import { assertEquals } from 'jsr:@std/assert@1';
import { welcomeCallAt, welcomeLabels } from './welcome-schedule.ts';
const rome = (d: Date) => new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
Deno.test('weekday request inside 9:30-19:30 is called 30-45 minutes later', () => {
  const req = new Date('2026-11-12T10:00:00+01:00');
  assertEquals((welcomeCallAt(req, 0).getTime() - req.getTime()) / 60000, 30);
  assertEquals((welcomeCallAt(req, 1).getTime() - req.getTime()) / 60000, 45);
});
Deno.test('request after 18:45 moves to next working day 9:30-10:00', () => {
  assertEquals(rome(welcomeCallAt(new Date('2026-11-12T18:50:00+01:00'), 0)), 'ven 09:30');
  assertEquals(rome(welcomeCallAt(new Date('2026-11-12T18:50:00+01:00'), 1)), 'ven 10:00');
});
Deno.test('early morning request is called the same day from 9:30', () => {
  assertEquals(rome(welcomeCallAt(new Date('2026-11-12T07:10:00+01:00'), 0)), 'gio 09:30');
});
Deno.test('Friday evening and weekend requests go to Monday', () => {
  assertEquals(rome(welcomeCallAt(new Date('2026-11-13T20:00:00+01:00'), 0)), 'lun 09:30');
  assertEquals(rome(welcomeCallAt(new Date('2026-11-14T11:00:00+01:00'), 0)), 'lun 09:30');
});
Deno.test('labels use the customer time zone', () => {
  const at = new Date('2026-11-12T10:40:00+01:00');
  assertEquals(welcomeLabels(at, new Date('2026-11-12T10:00:00+01:00'), 'Europe/London', 'en'), { day: 'today', time: '09:40' });
  assertEquals(welcomeLabels(new Date('2026-11-13T09:30:00+01:00'), at, 'Europe/Rome', 'it'), { day: 'venerdì 13 novembre', time: '09:30' });
});
