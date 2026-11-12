import { describe, it as test } from 'node:test';
import { strict as assert } from 'node:assert';
const expect = (v: unknown) => ({ toBe: (e: unknown) => assert.equal(v, e), toBeNull: () => assert.equal(v, null) });
import { brunoMayReplace, nextActivityDue, workingDayAt } from './nextActivity';
const rome = (d: Date | null) => d && new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
describe('prossima attività di Bruno', () => {
  test('follow-up offerta dopo 2 giorni lavorativi alle 10', () => expect(rome(workingDayAt(new Date('2026-11-12T11:00:00+01:00'), 2, 10))).toBe('lun 16, 10:00'));
  test('oggi se l\'ora è ancora davanti, altrimenti il giorno lavorativo dopo', () => {
    expect(rome(workingDayAt(new Date('2026-11-12T11:00:00+01:00'), 0, 15))).toBe('gio 12, 15:00');
    expect(rome(workingDayAt(new Date('2026-11-13T16:00:00+01:00'), 0, 15))).toBe('lun 16, 15:00');
  });
  test('data richiesta dal cliente rispettata', () => expect(rome(nextActivityDue({ action: 'chiamata', working_days: 1, hour: 11, explicit_date: '2026-11-20', notes: '' }, new Date('2026-11-12T11:00:00+01:00')))).toBe('ven 20, 11:00'));
  test('cliente non interessato: nessuna attività', () => expect(nextActivityDue({ action: 'nessuna', working_days: 0, hour: 9, explicit_date: null, notes: '' }, new Date())).toBeNull());
  test('non sovrascrive un\'attività futura del team', () => {
    const now = new Date('2026-11-12T11:00:00+01:00');
    expect(brunoMayReplace({ next_activity_date: '2026-11-20T10:00:00+01:00', next_activity_notes: 'Chiamare per sopralluogo' }, now)).toBe(false);
    expect(brunoMayReplace({ next_activity_date: '2026-11-20T10:00:00+01:00', next_activity_notes: 'Bruno: richiamare' }, now)).toBe(true);
    expect(brunoMayReplace({ next_activity_date: '2026-11-01T10:00:00+01:00', next_activity_notes: 'vecchia' }, now)).toBe(true);
  });
});
