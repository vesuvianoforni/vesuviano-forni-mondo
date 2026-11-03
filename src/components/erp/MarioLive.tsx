import { useCallback, useEffect, useState } from 'react';
import { OctagonX, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { marioAction } from '@/components/erp/MarioOperations';
import { MarioRunSummary, MARIO_RUN_LABELS, MARIO_RUN_STATUS, type MarioRun } from './MarioRunSummary';

type Live = {
  autopilot: { enabled: boolean; last_planned_on: string | null; last_tick_at: string | null; last_result: Record<string, unknown> | null; auto_paused_reason: string | null };
  settings: { paused: boolean; pause_reason: string | null };
  plans: { id: string; request: string; status: string; created_at: string; outreach_research_jobs: { status: string }[] }[];
  runs: MarioRun[];
  prospects: { id: string; name: string; city: string | null; country: string; email: string | null; qualified: boolean; recipient_eligibility: string; created_at: string }[];
  outbox: { id: string; recipient: string; subject: string; smtp_status: string; created_at: string }[];
  at: string;
};
const time = (v: string | null) => (v ? new Date(v).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—');
const PLAN: Record<string, string> = { running: 'In corso', queued: 'In coda', approved: 'Approvata', completed: 'Completata', cancelled: 'Annullata', failed: 'Errore', proposed: 'Proposta', superseded: 'Sostituita' };

export function MarioLive({ onUpdated }: { onUpdated?: () => void }) {
  const [d, setD] = useState<Live | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try { setD(await marioAction({ action: 'live' }) as Live); setError(''); } catch (e) { setError((e as Error).message); }
  }, []);
  useEffect(() => { void load(); const t = setInterval(() => { if (!document.hidden) void load(); }, 5000); return () => clearInterval(t); }, [load]);
  const stop = async () => {
    if (!confirm('Fermare l’autopilota? Gli invii vanno in pausa e le ricerche in corso vengono annullate.')) return;
    setBusy(true);
    try { await marioAction({ action: 'autopilot_stop' }); await load(); onUpdated?.(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  if (!d) return <p className="text-sm text-muted-foreground">{error || 'Caricamento attività…'}</p>;
  const running = d.autopilot.enabled;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2"><Radio className={running ? 'h-4 w-4 animate-pulse text-primary' : 'h-4 w-4 text-muted-foreground'} />
          <span className="text-sm font-semibold">{running ? 'Autopilota attivo' : 'Autopilota fermo'}</span>
          <Badge variant={d.settings.paused ? 'secondary' : 'default'}>{d.settings.paused ? 'Invii in pausa' : 'Invii attivi'}</Badge></div>
        <Button size="sm" variant="destructive" disabled={busy || (!running && d.settings.paused)} onClick={() => void stop()}><OctagonX className="mr-1.5 h-4 w-4" />Ferma autopilota</Button>
      </div>
      <p className="text-xs text-muted-foreground">Aggiornato ogni 5 secondi · ultimo {time(d.at)} · ultimo controllo automatico {time(String(d.autopilot.last_result?.at ?? '') || null)}</p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {(d.autopilot.auto_paused_reason || (d.settings.paused && d.settings.pause_reason)) && <p className="text-sm text-muted-foreground">{d.autopilot.auto_paused_reason ?? d.settings.pause_reason}</p>}

      <section className="space-y-2"><h3 className="text-sm font-semibold">Ricerche</h3>
        {d.plans.length ? d.plans.map(p => { const j = p.outreach_research_jobs ?? []; const n = (s: string) => j.filter(x => x.status === s).length; return (
          <div key={p.id} className="rounded-md border p-3 text-sm"><div className="flex justify-between gap-2"><span className="min-w-0 break-words">{p.request}</span><Badge variant="secondary">{PLAN[p.status] ?? p.status}</Badge></div>
            <p className="mt-1 text-xs text-muted-foreground">Lotti: {n('done')} completati · {n('running')} in corso · {n('queued')} in coda{n('failed') ? ` · ${n('failed')} con errore` : ''}</p></div>); })
          : <p className="text-sm text-muted-foreground">Nessuna ricerca.</p>}
      </section>

      <section className="space-y-1"><h3 className="text-sm font-semibold">Operazioni recenti</h3>
        {d.runs.length ? d.runs.map(r => <div key={r.id} className="break-words border-b py-2 text-xs"><p><span className="text-muted-foreground">{time(r.created_at)}</span> · {MARIO_RUN_LABELS[r.kind] ?? r.kind} · {MARIO_RUN_STATUS[r.status] ?? r.status}</p><p className="mt-1 text-muted-foreground"><MarioRunSummary run={r} /></p>{r.kind === 'enrich' && r.result?.reason && <details className="mt-1 text-muted-foreground"><summary className="cursor-pointer">Motivo dell’esito</summary><p className="mt-1 max-w-3xl">{r.result.reason}</p></details>}{r.error && <p className="mt-1 text-destructive">{r.error}</p>}</div>) : <p className="text-sm text-muted-foreground">Nessuna operazione.</p>}
      </section>

      <section className="space-y-1"><h3 className="text-sm font-semibold">Ultimi contatti salvati</h3>
        {d.prospects.length ? d.prospects.map(p => <p key={p.id} className="break-words text-xs"><span className="text-muted-foreground">{time(p.created_at)}</span> · {p.name} · {p.city ?? '—'} ({p.country}) · {p.email ?? 'email da trovare'}{p.qualified ? ' · verificato' : ''}</p>) : <p className="text-sm text-muted-foreground">Ancora nessun contatto.</p>}
      </section>

      <section className="space-y-1"><h3 className="text-sm font-semibold">Ultime email</h3>
        {d.outbox.length ? d.outbox.map(o => <p key={o.id} className="break-words text-xs"><span className="text-muted-foreground">{time(o.created_at)}</span> · {o.recipient} · {o.subject} · {o.smtp_status === 'accepted' ? 'inviata' : o.smtp_status}</p>) : <p className="text-sm text-muted-foreground">Nessuna email inviata.</p>}
      </section>
    </div>
  );
}
