import { useCallback, useEffect, useState } from 'react';
import { Check, ListOrdered, Loader2, Pause, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { callLabels, voiceRequest } from '@/lib/brunoVoice';

type Plan = { id: string; title: string; call_type: string; objective: string; gap_minutes: number; status: string; last_error: string | null };
type PlanCall = { id: string; status: string; error_code: string | null; plan_position: number; destination: string; customer_timezone: string; leads: { contact_name: string | null; company_name: string | null } | null };

const planLabels: Record<string, string> = { proposed: 'Da approvare', running: 'In esecuzione', paused: 'In pausa', completed: 'Completato', cancelled: 'Annullato' };

/** Operational call plan inside the Bruno chat: one approval, then calls run one at a time. */
export function BrunoPlanCard({ id }: { id: string }) {
  const [plan, setPlan] = useState<Plan | null>(null), [calls, setCalls] = useState<PlanCall[]>([]);
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const load = useCallback(async (action = 'plan_detail') => {
    const out = await voiceRequest<{ plan: Plan; calls: PlanCall[] }>({ action, plan_id: id });
    setPlan(out.plan); setCalls(out.calls);
  }, [id]);
  useEffect(() => { load().catch(e => setError((e as Error).message)); }, [load]);
  useEffect(() => {
    if (plan?.status !== 'running') return;
    const t = window.setInterval(() => void load().catch(() => undefined), 8000);
    return () => window.clearInterval(t);
  }, [plan?.status, load]);
  const run = async (action: string) => {
    setBusy(true); setError(null);
    try { await load(action); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  if (!plan) return <div className="not-prose mt-3 rounded-lg border p-3 text-sm text-muted-foreground">{error ?? <Loader2 className="h-4 w-4 animate-spin" />}</div>;
  const done = calls.filter(c => !['proposed', 'starting', 'dialing', 'active'].includes(c.status)).length;
  const callState = (c: PlanCall) => c.status === 'proposed' ? (plan.status === 'proposed' ? 'In piano' : 'In coda') : c.error_code === 'plan_skipped' ? 'Saltata' : callLabels[c.status] || c.status;
  return <div className="not-prose mt-3 space-y-3 rounded-lg border bg-card p-3 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-2 font-medium"><ListOrdered className="h-4 w-4 shrink-0" /><span className="break-words">{plan.title}</span></span>
      <Badge variant="outline">{planLabels[plan.status] || plan.status}</Badge>
    </div>
    <p className="break-words text-muted-foreground">{plan.objective}</p>
    <ol className="space-y-1">
      {calls.map(c => <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-2 py-1">
        <span className="min-w-0 break-words">{c.plan_position}. {c.leads?.contact_name || c.leads?.company_name || 'Cliente'} <span className="text-muted-foreground">· {c.destination}</span></span>
        <Badge variant={['dialing', 'active'].includes(c.status) ? 'default' : 'secondary'}>{callState(c)}</Badge>
      </li>)}
    </ol>
    <p className="text-xs text-muted-foreground">
      Una chiamata alla volta, {plan.gap_minutes} min di pausa tra una e l'altra, solo tra le 9 e le 20 ora locale del cliente. {plan.status !== 'proposed' && `${done}/${calls.length} gestite.`}
    </p>
    {plan.last_error && <p className="break-words text-xs text-destructive">{plan.last_error}</p>}
    {error && <p role="alert" className="break-words text-destructive">{error}</p>}
    <div className="flex flex-wrap gap-2">
      {plan.status === 'proposed' && <Button size="sm" disabled={busy || !calls.length} onClick={() => void run('plan_approve')}>{busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}Approva piano</Button>}
      {plan.status === 'running' && <Button size="sm" variant="outline" disabled={busy} onClick={() => void run('plan_pause')}><Pause className="mr-1 h-4 w-4" />Metti in pausa</Button>}
      {plan.status === 'paused' && <Button size="sm" disabled={busy} onClick={() => void run('plan_resume')}><Play className="mr-1 h-4 w-4" />Riprendi</Button>}
      {['proposed', 'running', 'paused'].includes(plan.status) && <Button size="sm" variant="outline" disabled={busy} onClick={() => void run('plan_cancel')}><X className="mr-1 h-4 w-4" />Annulla piano</Button>}
    </div>
    {plan.status === 'proposed' && <p className="text-xs text-muted-foreground">Per modificarlo scrivi a Bruno cosa cambiare: preparerà un nuovo piano.</p>}
  </div>;
}
