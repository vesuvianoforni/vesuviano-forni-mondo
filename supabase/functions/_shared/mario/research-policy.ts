import { z } from 'npm:zod@3';

export const ResearchScope = z.object({
  objective: z.string().trim().min(5).max(500),
  rationale: z.string().trim().min(10).max(2000),
  criteria: z.array(z.string().min(3).max(250)).min(1).max(8),
  exclusions: z.array(z.string().min(3).max(250)).max(8),
  targets: z.array(z.object({ provider: z.enum(['firecrawl', 'apify']), kind: z.enum(['pizzeria', 'partner']), country: z.enum(['UK', 'FR', 'DE']), city: z.string().trim().min(2).max(80), limit: z.number().int().min(1).max(50) }).strict()).min(1).max(12),
  verify_limit: z.number().int().min(0).max(20),
}).strict();
export type ResearchScopeType = z.infer<typeof ResearchScope>;

export function validateResearchScope(raw: unknown, markets: string[]) {
  const scope = ResearchScope.parse(raw);
  if (scope.targets.reduce((n, t) => n + t.limit, 0) > 100) throw new Error('Massimo 100 risultati esaminati per piano.');
  if (scope.targets.some(t => !markets.includes(t.country))) throw new Error('Mercato non abilitato nelle impostazioni di ricerca.');
  if (scope.targets.some(t => t.provider === 'firecrawl' && t.limit > 10)) throw new Error('Firecrawl: massimo 10 risultati per passaggio.');
  const keys = scope.targets.map(t => `${t.provider}:${t.kind}:${t.country}:${t.city.toLowerCase()}`);
  if (new Set(keys).size !== keys.length) throw new Error('Il piano ripete la stessa ricerca.');
  return scope;
}

export function researchCanRun(plan: { status: string; approved_at: string | null; approved_by: string | null }) {
  return ['queued', 'running'].includes(plan.status) && Boolean(plan.approved_at && plan.approved_by);
}

export function researchOperationAllowed(kind: string) { return ['discover', 'verify'].includes(kind); }