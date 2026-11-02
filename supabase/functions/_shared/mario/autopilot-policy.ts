import { MANUAL_ONLY, type MarioCountry } from './markets.ts';

export const AUTOPILOT_THREAD = '00000000-0000-4000-8000-00000000a070';
export const WARMUP_STEPS = [40, 80, 120, 160, 200];
export const ABSOLUTE_DAILY_CAP = 200;

// Rotation of large pizza markets across Europe (Italy excluded). Germany stays in research for manual contact only.
export const TERRITORIES: { country: MarioCountry; city: string }[] = [
  { country: 'UK', city: 'London' }, { country: 'FR', city: 'Paris' }, { country: 'ES', city: 'Madrid' }, { country: 'NL', city: 'Amsterdam' },
  { country: 'UK', city: 'Manchester' }, { country: 'FR', city: 'Lyon' }, { country: 'ES', city: 'Barcelona' }, { country: 'BE', city: 'Brussels' },
  { country: 'IE', city: 'Dublin' }, { country: 'AT', city: 'Vienna' }, { country: 'CH', city: 'Zurich' }, { country: 'PT', city: 'Lisbon' },
  { country: 'UK', city: 'Birmingham' }, { country: 'FR', city: 'Marseille' }, { country: 'DK', city: 'Copenhagen' }, { country: 'SE', city: 'Stockholm' },
  { country: 'NL', city: 'Rotterdam' }, { country: 'ES', city: 'Valencia' }, { country: 'NO', city: 'Oslo' }, { country: 'PL', city: 'Warsaw' },
  { country: 'UK', city: 'Glasgow' }, { country: 'FR', city: 'Nice' }, { country: 'CZ', city: 'Prague' }, { country: 'FI', city: 'Helsinki' },
  { country: 'BE', city: 'Antwerp' }, { country: 'UK', city: 'Leeds' }, { country: 'FR', city: 'Bordeaux' }, { country: 'ES', city: 'Malaga' },
  { country: 'PT', city: 'Porto' }, { country: 'CH', city: 'Geneva' }, { country: 'LU', city: 'Luxembourg' }, { country: 'UK', city: 'Bristol' },
  { country: 'FR', city: 'Toulouse' }, { country: 'DE', city: 'Berlin' }, { country: 'DE', city: 'Munich' },
];

export function nextTerritory(cursor: number, allowed: string[]) {
  for (let i = 0; i < TERRITORIES.length; i++) {
    const index = (cursor + i) % TERRITORIES.length;
    const t = TERRITORIES[index];
    if (allowed.includes(t.country) && t.country !== ('IT' as string)) return { ...t, cursor: index + 1 };
  }
  throw new Error('Nessun territorio abilitato per l’autopilota.');
}

// Warm-up: 40/day in week 1, then +40 per week until 200. No verified provider means zero.
export function warmupLimit(verifiedAt: string | null, configured: number, now = new Date()) {
  if (!verifiedAt) return 0;
  const weeks = Math.floor((now.getTime() - new Date(verifiedAt).getTime()) / 604_800_000);
  return Math.min(configured, ABSOLUTE_DAILY_CAP, WARMUP_STEPS[Math.min(WARMUP_STEPS.length - 1, Math.max(0, weeks))]);
}

// Each new prospect costs 3 emails (day 0/3/7): new starts per day keep the steady state inside the cap.
export const dailyNewStarts = (cap: number) => Math.floor(Math.max(0, cap) / 3);

export function dailyScope(t: { country: MarioCountry; city: string }, goal: number) {
  const per = Math.min(100, Math.max(10, Math.ceil(goal / 2)));
  const queries = ['neapolitan pizza', 'pizzeria wood fired oven', 'artisan pizzeria'];
  const targets = [
    { provider: 'apify' as const, kind: 'pizzeria' as const, country: t.country, city: t.city, query: queries[0], limit: per },
    { provider: 'apify' as const, kind: 'pizzeria' as const, country: t.country, city: t.city, query: queries[2], limit: per },
    { provider: 'firecrawl' as const, kind: 'pizzeria' as const, country: t.country, city: t.city, query: `${queries[1]} ${t.city}`, limit: Math.min(100, per) },
  ];
  return {
    objective: `Autopilota: pizzerie artigianali a ${t.city} (${t.country})`,
    rationale: 'Piano automatico generato dall’autopilota di Mario secondo l’obiettivo: vendere forni a pizzerie in Europa, Italia esclusa. Fonti: Google Maps (Apify) e ricerca web (Firecrawl). Contatti già presenti, clienti CRM e opposizioni sono esclusi.',
    criteria: ['Pizzeria con sito ufficiale', 'Email aziendale pubblicata sul sito ufficiale', 'Attività in corso'],
    exclusions: ['Catene e franchising', 'Directory senza sito ufficiale'],
    organization_goal: goal,
    targets,
    verify_limit: goal,
  };
}

const FREE_MAIL = /@(gmail|yahoo|hotmail|outlook|live|icloud|aol|gmx|web|orange|free|wanadoo|libero)\./i;
const ROLE_BAD = /^(no-?reply|donotreply|privacy|legal|gdpr|dpo|abuse|postmaster|careers|jobs|hr)@/i;
// Automatic eligibility is fail-closed: business mailbox on the official website domain, sendable market only.
export function autoEligibility(p: { qualified: boolean; email: string | null; domain: string | null; country: string; status: string; recipient_eligibility: string; replied_at: string | null }) {
  if (p.recipient_eligibility !== 'unreviewed') return null;
  if (!p.qualified || !p.email || !p.domain || p.replied_at) return 'blocked';
  if (MANUAL_ONLY.includes(p.country) || p.country === 'IT') return 'blocked';
  if (!['new', 'draft'].includes(p.status)) return 'blocked';
  const email = p.email.toLowerCase(); const domain = p.domain.toLowerCase().replace(/^www\./, '');
  if (FREE_MAIL.test(email) || ROLE_BAD.test(email)) return 'blocked';
  const host = email.split('@')[1] ?? '';
  return host === domain || host.endsWith(`.${domain}`) ? 'eligible' : 'blocked';
}
