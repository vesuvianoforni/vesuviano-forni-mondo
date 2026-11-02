import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Loader2, RefreshCw, Search, Square, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { marioAction } from './MarioOperations';

type Target = { provider: string; kind: string; country: string; city: string; limit: number };
type Plan = { id: string; request: string; status: string; approved_at: string | null; discovered: number; skipped: number; verified: number; error: string | null; created_at: string; proposal: { objective: string; rationale: string; criteria: string[]; exclusions: string[]; targets: Target[]; verify_limit: number }; analysis: { organizations?: { total: number }[]; analyzed_at?: string } };
type Job = { id: string; plan_id: string; kind: string; status: string; input: Target & { prospect_id?: string }; result: { prospect_ids?: string[]; qualified?: boolean } | null; error: string | null; lease_until: string | null };
const STATES: Record<string, string> = { proposed: 'Da approvare', queued: 'Approvata · in avvio', running: 'Ricerca in corso', completed: 'Completata', cancelled: 'Arrestata', failed: 'Interrotta', superseded: 'Sostituita' };

export function MarioResearch({ threadId, revision, onUpdated, onPlans, compact = false }: { threadId: string; revision: number; onUpdated: () => void; onPlans?: (count: number) => void; compact?: boolean }) {
  const [plans, setPlans] = useState<Plan[]>([]); const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<Plan | null>(null); const [request, setRequest] = useState('');
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; }, []);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    const data = await marioAction({ action: 'research_plans', thread_id: threadId });
    if (current !== generation.current) return;
    setPlans(data.plans); setJobs(data.jobs); setError(''); setLoading(false);
    onPlans?.(data.plans.filter((p: Plan) => p.status === 'proposed').length);
  }, [threadId, onPlans]);
  useEffect(() => { let live = true; refresh().catch(e => { if (live) { setError(e.message); setLoading(false); } });
    const channel = supabase.channel(`mario-research-${threadId}-${crypto.randomUUID()}`).on('postgres_changes', { event: '*', schema: 'public', table: 'outreach_research_plans', filter: `thread_id=eq.${threadId}` }, () => { if (live) void refresh().catch(e => setError(e.message)); }).subscribe();
    return () => { live = false; void supabase.removeChannel(channel); };
  }, [refresh, revision, threadId]);
  const active = plans.some(p => ['queued', 'running'].includes(p.status));
  useEffect(() => { if (!active) return; const timer = window.setInterval(() => void refresh().catch(e => setError(e.message)), 15000); return () => window.clearInterval(timer); }, [active, refresh]);
  const act = async (body: Record<string, unknown>) => { setBusy(true); setError(''); try { await marioAction(body); await refresh(); onUpdated(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } };
  if (compact && !plans.length && !error) return null;
  return <div className="min-w-0 space-y-4">
    <div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-base font-semibold"><Search className="h-4 w-4 text-primary" />Piano di ricerca</h2><Button size="icon" variant="ghost" title="Aggiorna piani" aria-label="Aggiorna piani" disabled={busy} onClick={() => void refresh().catch(e => setError(e.message))}><RefreshCw className="h-4 w-4" /></Button></div>
    {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
    {loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Caricamento piani…</p>}
    {!compact && <form className="space-y-2 border-b pb-4" onSubmit={e => { e.preventDefault(); void act({ action: 'propose_research', thread_id: threadId, request }); }}><Textarea aria-label="Obiettivo ricerca Mario" placeholder="Quali organizzazioni vuoi cercare?" value={request} onChange={e => setRequest(e.target.value)} required minLength={5} maxLength={4000} rows={3} /><Button type="submit" variant="outline" disabled={busy || request.trim().length < 5}><Search className="mr-2 h-4 w-4" />{busy ? 'Mario sta analizzando…' : 'Proponi piano'}</Button></form>}
    {!plans.length && !loading && <p className="text-sm text-muted-foreground">Nessun piano proposto.</p>}
    {(compact ? plans.slice(0, 1) : plans).map(plan => {
      const steps = jobs.filter(j => j.plan_id === plan.id); const done = steps.filter(j => j.status === 'done').length;
      const expired = steps.some(j => j.status === 'running' && j.lease_until && Date.parse(j.lease_until) < Date.now());
      const ids = Array.from(new Set(steps.flatMap(j => j.result?.prospect_ids ?? [])));
      const proposed = plan.status === 'proposed'; const running = ['queued', 'running'].includes(plan.status);
      return <section key={plan.id} className="min-w-0 space-y-3 border-b pb-5">
        <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="min-w-0 break-words font-semibold">{plan.proposal.objective}</h3><Badge variant={proposed ? 'outline' : 'secondary'}>{STATES[plan.status] ?? plan.status}</Badge></div>
        <p className="break-words text-sm text-muted-foreground">{plan.proposal.rationale}</p>
        <dl className="grid grid-cols-2 gap-2 text-xs"><div><dt className="text-muted-foreground">Risultati da esaminare · massimo</dt><dd className="mt-1 font-semibold">{plan.proposal.targets.reduce((n, t) => n + t.limit, 0)}</dd></div><div><dt className="text-muted-foreground">Siti da verificare · massimo</dt><dd className="mt-1 font-semibold">{plan.proposal.verify_limit}</dd></div></dl>
        <div className="divide-y border-y">{plan.proposal.targets.map((t, i) => <div key={i} className="flex flex-wrap justify-between gap-1 py-2 text-xs"><span>{t.kind === 'partner' ? 'Partner Horeca' : 'Pizzerie'} · {t.city} · {t.country}</span><span className="text-muted-foreground">{t.provider === 'apify' ? 'Apify' : 'Firecrawl'} · max {t.limit}</span></div>)}</div>
        <details><summary className="cursor-pointer text-xs font-medium">Criteri, esclusioni e analisi</summary><ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">{plan.proposal.criteria.map(c => <li key={c}>{c}</li>)}{plan.proposal.exclusions.map(c => <li key={c}>Esclusione: {c}</li>)}</ul><p className="mt-2 text-xs text-muted-foreground">Archivio Mario analizzato: {plan.analysis.organizations?.reduce((n, r) => n + Number(r.total), 0) ?? 0} organizzazioni. I risultati saranno confrontati con archivio, domini CRM ed esclusioni. Solo i siti effettivamente verificati avranno un esito di pertinenza; gli altri criteri restano da rivedere.</p></details>
        <p className="text-xs text-muted-foreground">Solo ricerca e verifica · nessuna email autorizzata. Germania: revisione manuale.</p>
        {proposed && <div className="flex flex-wrap gap-2"><Button size="sm" disabled={busy} onClick={() => setConfirm(plan)}><Check className="mr-1.5 h-4 w-4" />Approva e avvia ricerca</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => void act({ action: 'cancel_research', id: plan.id })}>Scarta piano</Button></div>}
        {!proposed && <><div role="status" className="grid grid-cols-3 gap-2 border-y py-3 text-xs"><div><span className="block text-muted-foreground">Nuove organizzazioni</span><strong>{plan.discovered}</strong></div><div><span className="block text-muted-foreground">Escluse / duplicate</span><strong>{plan.skipped}</strong></div><div><span className="block text-muted-foreground">Pertinenti verificate</span><strong>{plan.verified}</strong></div></div><p className="text-xs text-muted-foreground">{done} / {steps.length} passaggi completati{plan.approved_at && ` · approvato ${new Date(plan.approved_at).toLocaleString('it-IT')}`}</p>{running && <Button size="sm" variant="outline" disabled={busy} onClick={() => void act({ action: 'cancel_research', id: plan.id })}><Square className="mr-1.5 h-3.5 w-3.5" />Arresta ricerca</Button>}</>}
        {expired && <p role="alert" className="text-xs text-destructive">Un passaggio non ha confermato l’esito. Arresta il piano e verifica le attività prima di riprovare.</p>}
        {plan.error && <p role="alert" className="break-words text-xs text-destructive">{plan.error}</p>}
        {steps.length > 0 && <details><summary className="cursor-pointer text-xs font-medium">Passaggi della ricerca</summary><div className="mt-2 space-y-2">{steps.map(j => <div key={j.id} className="break-words border-b pb-2 text-xs"><span>{j.kind === 'verify' ? 'Verifica sito ufficiale' : `${j.input.city} · ${j.input.provider}`}</span><span className="ml-2 text-muted-foreground">{({ queued: 'In attesa', running: 'In corso', done: 'Completato', failed: 'Interrotto', cancelled: 'Arrestato' } as Record<string, string>)[j.status]}</span>{j.error && <p className="mt-1 text-destructive">{j.error}</p>}</div>)}</div></details>}
        {ids.length > 0 && <details><summary className="cursor-pointer text-xs font-medium">Organizzazioni salvate · {ids.length}</summary><div className="mt-2 flex flex-col gap-2">{ids.map((id, i) => <a key={id} href={`/erp/mario?chat=${threadId}&prospect=${id}`} className="flex items-center gap-1 text-xs text-primary underline">Apri organizzazione {i + 1}<ExternalLink className="h-3 w-3" /></a>)}</div></details>}
      </section>;
    })}
    <AlertDialog open={Boolean(confirm)} onOpenChange={open => { if (!open) setConfirm(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Avviare la ricerca approvata?</AlertDialogTitle><AlertDialogDescription>{confirm?.proposal.objective}. Mario userà i servizi indicati, che possono consumare credito, e salverà le organizzazioni in archivio. Il numero indicato è un massimo, non una garanzia di nuovi contatti. La ricerca continua anche chiudendo questa pagina. Non verranno preparate o inviate email.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel><AlertDialogAction onClick={() => { if (confirm) void act({ action: 'approve_research', id: confirm.id }); setConfirm(null); }}>Conferma e avvia</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}