// Pure scheduling rules for the new-lead welcome (owner decision): the WhatsApp leaves within minutes; the call is
// the same day 15-20 min after the request when it falls within 9:30-19:30 Rome time on a weekday (latest request
// 19:10 so the call stays in the window), otherwise the next working day between 9:30 and 10:00.
const ZONE = 'Europe/Rome';
export type WelcomeLanguage = 'en' | 'it' | 'fr' | 'de' | 'es';
export const WELCOME_LANGUAGES: WelcomeLanguage[] = ['en', 'it', 'fr', 'de', 'es'];
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
  if (r.weekday <= 5 && minutes >= 570 && minutes <= 1150) return new Date(request.getTime() + Math.round(15 + 5 * j) * 60000);
  let day = new Date(Date.UTC(r.y, r.m - 1, r.d));
  let weekday = r.weekday;
  if (!(weekday <= 5 && minutes < 570)) {
    do { day = new Date(day.getTime() + 86400000); weekday = weekday % 7 + 1; } while (weekday > 5);
  }
  return zoned(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), 9, 30 + Math.round(30 * j), ZONE);
}
const LOCALES: Record<WelcomeLanguage, string> = { en: 'en-GB', it: 'it-IT', fr: 'fr-FR', de: 'de-DE', es: 'es-ES' };
const SOON: Record<WelcomeLanguage, (t: string) => string> = {
  en: t => `in about 15-20 minutes (around ${t})`, it: t => `tra circa 15-20 minuti (verso le ${t})`,
  fr: t => `dans environ 15-20 minutes (vers ${t})`, de: t => `in etwa 15-20 Minuten (gegen ${t} Uhr)`, es: t => `en unos 15-20 minutos (hacia las ${t})`,
};
const TODAY: Record<WelcomeLanguage, (t: string) => string> = {
  en: t => `today at ${t}`, it: t => `oggi alle ${t}`, fr: t => `aujourd'hui à ${t}`, de: t => `heute um ${t} Uhr`, es: t => `hoy a las ${t}`,
};
const LATER: Record<WelcomeLanguage, (d: string, t: string) => string> = {
  en: (d, t) => `on ${d} at ${t}`, it: (d, t) => `${d} alle ${t}`, fr: (d, t) => `le ${d} à ${t}`, de: (d, t) => `am ${d} um ${t} Uhr`, es: (d, t) => `el ${d} a las ${t}`,
};
// When the call happens, as the customer reads it in their own time zone.
export function welcomeWhen(callAt: Date, now: Date, zone: string, language: WelcomeLanguage) {
  const locale = LOCALES[language];
  const time = new Intl.DateTimeFormat(locale, { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(callAt);
  const day = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: zone }).format(d);
  if (day(callAt) === day(now)) return callAt.getTime() - now.getTime() <= 30 * 60000 ? SOON[language](time) : TODAY[language](time);
  return LATER[language](new Intl.DateTimeFormat(locale, { timeZone: zone, weekday: 'long', day: 'numeric', month: 'long' }).format(callAt), time);
}
