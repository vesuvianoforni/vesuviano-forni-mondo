export type MarioRun = {
  id: string;
  kind: string;
  status: string;
  found: number | null;
  error: string | null;
  created_at: string;
  result?: { email_verified?: boolean; qualified?: boolean; reason?: string; drafts?: number } | null;
};

export const MARIO_RUN_LABELS: Record<string, string> = {
  firecrawl_search: 'Ricerca siti', apify_search: 'Ricerca attività locali', enrich: 'Verifica sito ed email', draft: 'Bozze email',
};
export const MARIO_RUN_STATUS: Record<string, string> = {
  running: 'In corso', succeeded: 'Completata', failed: 'Interrotta',
};

export function MarioRunSummary({ run }: { run: MarioRun }) {
  if (run.status !== 'succeeded') return null;
  if (run.kind === 'enrich') {
    const result = run.result;
    return <span>
      {result?.email_verified === true ? 'Email verificata e salvata' : result?.email_verified === false ? 'Nessuna email aziendale verificata' : 'Esito email non disponibile'}
      {' · '}{result?.qualified === true ? 'Contatto pertinente' : result?.qualified === false ? 'Pertinenza da rivedere' : 'Esito pertinenza non disponibile'}
    </span>;
  }
  if (run.kind === 'firecrawl_search' || run.kind === 'apify_search') return <span>{run.found ?? 0} candidati salvati</span>;
  if (run.kind === 'draft' && typeof run.result?.drafts === 'number') return <span>{run.result.drafts} bozze preparate</span>;
  return null;
}