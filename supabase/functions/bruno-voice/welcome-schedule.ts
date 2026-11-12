// Pure scheduling rules for the new-lead welcome (owner decision): same day 30-45 min after the request when it
// falls within 9:30-19:30 Rome time on a weekday (latest request 18:45 so the call stays in the window),
// otherwise the next working day between 9:30 and 10:00.
const ZONE = 'Europe/Rome';
function parts(date: Date, zone: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23' }).formatToParts(date).map(x => [x.type, x.value]));
  const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.weekday) + 1;
  return { y: Number(p.year), m: Number(p.month), d: Number(p.day), h: Number(p.hour), min: Number(p.minute), weekday };
}
function zoned(y: number, m: number, d: number, h: number, min: number, zone: string) {
  const guess = Date.UTC(y, m - 1, d, h, min);
  const p = parts(new Date(guess), zone);
  const offset = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min) - guess;
  return new Date(guess - offset);
}
export function welcomeCallAt(request: Date, jitter = Math.random()): Date {
  const j = Math.min(Math.max(jitter, 0), 1);
  const r = parts(request, ZONE);
  const minutes = r.h * 60 + r.min;
  if (r.weekday <= 5 && minutes >= 570 && minutes <= 1125) return new Date(request.getTime() + Math.round(30 + 15 * j) * 60000);
  let day = new Date(Date.UTC(r.y, r.m - 1, r.d));
  let weekday = r.weekday;
  if (!(weekday <= 5 && minutes < 570)) {
    do { day = new Date(day.getTime() + 86400000); weekday = weekday % 7 + 1; } while (weekday > 5);
  }
  return zoned(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), 9, 30 + Math.round(30 * j), ZONE);
}
// Day and time as the customer reads them, in their own time zone.
export function welcomeLabels(callAt: Date, now: Date, zone: string, language: 'it' | 'en') {
  const locale = language === 'it' ? 'it-IT' : 'en-GB';
  const time = new Intl.DateTimeFormat(locale, { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(callAt);
  const sameDay = new Intl.DateTimeFormat('en-CA', { timeZone: zone }).format(callAt) === new Intl.DateTimeFormat('en-CA', { timeZone: zone }).format(now);
  const date = new Intl.DateTimeFormat(locale, { timeZone: zone, weekday: 'long', day: 'numeric', month: 'long' }).format(callAt);
  return { day: sameDay ? (language === 'it' ? 'oggi' : 'today') : (language === 'it' ? date : `on ${date}`), time };
}
