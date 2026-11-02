import { z } from 'npm:zod@3';

export const CAMPAIGN_ORGANIZATION_GOAL = 500;
export const DISCOVERY_BUDGET = 1500;
export const DISCOVERY_BATCH_SIZE = 100;
export const ResearchScope = z.object({
  objective: z.string().trim().min(5).max(500),
  rationale: z.string().trim().min(10).max(2000),
  criteria: z.array(z.string().min(3).max(250)).min(1).max(8),
  exclusions: z.array(z.string().min(3).max(250)).max(8),
  organization_goal: z.number().int().min(1).max(CAMPAIGN_ORGANIZATION_GOAL),
  targets: z.array(z.object({ provider: z.enum(['firecrawl', 'apify']), kind: z.enum(['pizzeria', 'partner']), country: z.enum(['UK', 'FR', 'DE']), city: z.string().trim().min(2).max(80), query: z.string().trim().min(3).max(250), limit: z.number().int().min(1).max(DISCOVERY_BATCH_SIZE) }).strict()).min(1).max(30),
  verify_limit: z.number().int().min(0).max(CAMPAIGN_ORGANIZATION_GOAL),
}).strict();
export type ResearchScopeType = z.infer<typeof ResearchScope>;

export function validateResearchScope(raw: unknown, markets: string[]) {
  // Old saved plans retain their original bounds and do not acquire a larger scope on approval.
  const legacy = raw as { organization_goal?: unknown; targets?: { query?: string; kind: string; city: string }[] };
  const scope = ResearchScope.parse({ ...legacy, organization_goal: legacy.organization_goal ?? 500,
    targets: legacy.targets?.map(t => ({ ...t, query: t.query ?? `${t.kind} ${t.city}` })) });
  const budget = scope.targets.reduce((n, t) => n + t.limit, 0);
  if (budget > DISCOVERY_BUDGET) throw new Error('Massimo 1.500 risultati esaminati per campagna.');
  if (legacy.organization_goal !== undefined && (budget < scope.organization_goal || scope.verify_limit !== scope.organization_goal)) throw new Error('Il piano deve coprire l’obiettivo e verificare fino a 500 organizzazioni.');
  if (scope.targets.some(t => !markets.includes(t.country))) throw new Error('Mercato non abilitato nelle impostazioni di ricerca.');
  const keys = scope.targets.map(t => `${t.provider}:${t.kind}:${t.country}:${t.city.toLowerCase()}:${t.query.toLowerCase()}`);
  if (new Set(keys).size !== keys.length) throw new Error('Il piano ripete la stessa ricerca.');
  return scope;
}

export function researchCanRun(plan: { status: string; approved_at: string | null; approved_by: string | null }) {
  return ['queued', 'running'].includes(plan.status) && Boolean(plan.approved_at && plan.approved_by);
}

export function researchOperationAllowed(kind: string) { return ['discover', 'verify'].includes(kind); }

export function boundedDiscoveryLimit(requested: number, saved: number, goal: number) {
  return Math.max(0, Math.min(requested, DISCOVERY_BATCH_SIZE, goal - saved));
}