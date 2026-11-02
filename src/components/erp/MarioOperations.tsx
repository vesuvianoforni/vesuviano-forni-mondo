import { useCallback, useEffect, useState } from 'react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Search, RefreshCw, BookOpen, Workflow, Save, Plus, Loader2, Check, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Knowledge = { id: string; title: string; content: string; source_url: string | null; active: boolean };
type Draft = { id: string; prospect_id: string; step: number; subject: string; body: string; html: string; status: string };
type Run = { id: string; kind: string; status: string; found: number; error: string | null; created_at: string };
interface Overview { config: { instructions: string; ai_status: number | null; ai_reason: string | null }; knowledge: Knowledge[]; runs: Run[]; messages: Draft[]; is_admin: boolean; system_prompt: string; version: string }

export async function marioAction(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('mario-agent', { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const detail = await error.context.json().catch(() => ({}));
      throw new Error(detail.error ?? 'Operazione non riuscita');
    }
    throw error;
  }
  return data;
}

export function MarioOperations({ prospectId, onUpdated, initialTab = 'research' }: { prospectId?: string; onUpdated: () => void; initialTab?: string }) {
  const [data, setData] = useState<Overview | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [tab, setTab] = useState(initialTab); const [city, setCity] = useState('London'); const [country, setCountry] = useState('UK'); const [kind, setKind] = useState('pizzeria'); const [provider, setProvider] = useState('firecrawl'); const [limit, setLimit] = useState(10);
  const [instructions, setInstructions] = useState(''); const [edit, setEdit] = useState<Knowledge | null>(null); const [preview, setPreview] = useState<Draft | null>(null);
  const refresh = useCallback(async () => { const next = await marioAction({ action: 'overview' }) as Overview; if (prospectId) { const own = await marioAction({ action: 'prospect_messages', id: prospectId }); next.messages = own.messages; } setData(next); setInstructions(next.config.instructions); }, [prospectId]);
  useEffect(() => { refresh().catch(e => setError(e.message)); }, [refresh]);
  const act = async (body: Record<string, unknown>) => {
    setBusy(true); setError(''); setNotice('');
    try { const result = await marioAction(body); setNotice(result.note ?? 'Operazione completata.'); await refresh(); onUpdated(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const drafts = data?.messages.filter(m => !prospectId || m.prospect_id === prospectId) ?? [];
  return <div className="min-w-0 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      {!prospectId && <h2 className="text-lg font-semibold">Centro operativo Mario</h2>}
      <Button variant="ghost" size="icon" aria-label="Aggiorna attività" title="Aggiorna attività" disabled={busy} onClick={() => void act({ action: 'overview' })}><RefreshCw className="h-4 w-4" /></Button>
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
    {busy && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Operazione in corso…</p>}
    {data?.config.ai_status && <div className="flex flex-wrap items-center gap-2 border-l-2 border-destructive pl-3 text-sm"><p>{data.config.ai_reason}</p>{data.is_admin && <Button variant="outline" size="sm" onClick={() => void act({ action: 'resume_ai' })}>Riprendi AI</Button>}</div>}
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="h-auto max-w-full flex-wrap justify-start">
        <TabsTrigger value="research"><Search className="mr-1.5 h-4 w-4" />Ricerca</TabsTrigger>
        <TabsTrigger value="drafts"><Workflow className="mr-1.5 h-4 w-4" />Sequenze</TabsTrigger>
        {!prospectId && <TabsTrigger value="knowledge"><BookOpen className="mr-1.5 h-4 w-4" />Conoscenze</TabsTrigger>}
        {!prospectId && <TabsTrigger value="instructions">Istruzioni</TabsTrigger>}
      </TabsList>
      <TabsContent value="research" className="space-y-4">
        {prospectId ? <div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => void act({ action: 'enrich', id: prospectId })}><Search className="mr-2 h-4 w-4" />Verifica sito e contatto</Button><Button variant="outline" disabled={busy} onClick={() => void act({ action: 'draft', id: prospectId })}><Workflow className="mr-2 h-4 w-4" />Prepara sequenza</Button></div> :
          <form onSubmit={e => { e.preventDefault(); void act({ action: 'search', provider, city, country, kind, limit }); }} className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-muted-foreground">Tipo<select aria-label="Tipo di attività" className="h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground" value={kind} onChange={e => setKind(e.target.value)}><option value="pizzeria">Pizzerie</option><option value="partner">Partner Horeca</option></select></label>
            <label className="space-y-1 text-xs text-muted-foreground">Paese<select aria-label="Mercato ricerca" className="h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground" value={country} onChange={e => setCountry(e.target.value)}><option value="UK">Regno Unito</option><option value="FR">Francia</option><option value="DE">Germania · revisione manuale</option></select></label>
            <label className="space-y-1 text-xs text-muted-foreground">Città<Input aria-label="Città ricerca" required minLength={2} maxLength={80} value={city} onChange={e => setCity(e.target.value)} /></label>
            <label className="space-y-1 text-xs text-muted-foreground">Risultati<Input aria-label="Numero risultati" type="number" required min={1} max={provider === 'firecrawl' ? 10 : 50} value={limit} onChange={e => setLimit(Number(e.target.value))} /></label>
            <label className="space-y-1 text-xs text-muted-foreground">Servizio<select aria-label="Servizio ricerca" className="h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground" value={provider} onChange={e => { setProvider(e.target.value); setLimit(10); }}><option value="firecrawl">Firecrawl · siti web</option><option value="apify">Apify · attività locali</option></select></label>
            <Button className="self-end" type="submit" disabled={busy}><Search className="mr-2 h-4 w-4" />Avvia ricerca</Button>
          </form>}
        <div className="divide-y border-y">{data?.runs.map(r => <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><div className="min-w-0"><p className="font-medium">{({ firecrawl_search: 'Ricerca siti', apify_search: 'Ricerca attività locali', enrich: 'Verifica prospect', draft: 'Bozze email' } as Record<string, string>)[r.kind] ?? r.kind}</p><p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString('it-IT')} · {r.found} candidati</p>{r.error && <p className="max-w-xl break-words text-xs text-destructive">{r.error}</p>}</div><div className="flex items-center gap-2"><Badge variant="secondary">{({ running: 'In corso', succeeded: 'Completata', failed: 'Interrotta' } as Record<string, string>)[r.status] ?? r.status}</Badge>{r.kind === 'apify_search' && r.status === 'running' && <Button size="sm" variant="outline" disabled={busy} onClick={() => void act({ action: 'collect', id: r.id })}><RefreshCw className="mr-1 h-3.5 w-3.5" />Aggiorna</Button>}</div></div>)}</div>
      </TabsContent>
      <TabsContent value="drafts" className="space-y-3">
        {!drafts.length && <p className="py-6 text-sm text-muted-foreground">Nessuna bozza disponibile.</p>}
        {drafts.map(m => <div key={m.id} className="border-b py-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">Giorno {[0,3,7][m.step]} · {m.subject}</p><Badge variant="secondary">{m.status === 'approved' ? 'Approvata · non inviata' : 'Bozza'}</Badge></div><p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">{m.body}</p><div className="mt-3 flex gap-2"><Button variant="outline" size="sm" onClick={() => setPreview(m)}><Eye className="mr-1.5 h-4 w-4" />Anteprima</Button>{m.status === 'draft' && <Button variant="outline" size="sm" disabled={busy} onClick={() => void act({ action: 'approve', id: m.id })}><Check className="mr-1.5 h-4 w-4" />Approva contenuto</Button>}</div></div>)}
      </TabsContent>
      <TabsContent value="knowledge" className="space-y-4">
        {data?.is_admin && <Button size="sm" variant="outline" onClick={() => setEdit({ id: '', title: '', content: '', source_url: null, active: true })}><Plus className="mr-1 h-4 w-4" />Aggiungi conoscenza</Button>}
        {data?.knowledge.map(k => <section key={k.id} className="border-b pb-4"><div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{k.title}{!k.active && <Badge variant="secondary" className="ml-2">Disattivata</Badge>}</h3>{data.is_admin && <Button size="sm" variant="ghost" onClick={() => setEdit(k)}>Modifica</Button>}</div><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{k.content}</p>{k.source_url && <a href={k.source_url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-xs text-primary underline">{k.source_url}</a>}</section>)}
      </TabsContent>
      <TabsContent value="instructions" className="space-y-4">
        <label className="block space-y-2 text-sm font-medium">Istruzioni condivise del team<Textarea aria-label="Istruzioni condivise Mario" value={instructions} onChange={e => setInstructions(e.target.value)} maxLength={4000} rows={7} readOnly={!data?.is_admin} /></label>
        {data?.is_admin && <Button disabled={busy} onClick={() => void act({ action: 'instructions', instructions })}><Save className="mr-2 h-4 w-4" />Salva istruzioni</Button>}
        <details className="border-t pt-4"><summary className="cursor-pointer text-sm font-medium">System prompt · {data?.version}</summary><pre className="mt-3 whitespace-pre-wrap break-words text-xs text-muted-foreground">{data?.system_prompt}</pre></details>
      </TabsContent>
    </Tabs>
    <Dialog open={Boolean(preview)} onOpenChange={() => setPreview(null)}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{preview?.subject}</DialogTitle></DialogHeader><iframe title="Anteprima email Mario" sandbox="" srcDoc={preview?.html ?? ''} className="h-[65dvh] w-full rounded-md border bg-background" /></DialogContent></Dialog>
    <Dialog open={Boolean(edit)} onOpenChange={() => setEdit(null)}><DialogContent><DialogHeader><DialogTitle>{edit?.id ? 'Modifica conoscenza' : 'Nuova conoscenza'}</DialogTitle></DialogHeader>{edit && <form className="space-y-3" onSubmit={e => { e.preventDefault(); void act({ action: 'knowledge', ...edit, id: edit.id || null }); setEdit(null); }}><Input aria-label="Titolo conoscenza" required minLength={2} maxLength={160} placeholder="Titolo" value={edit.title} onChange={e => setEdit({ ...edit, title: e.target.value })} /><Textarea aria-label="Contenuto conoscenza" required minLength={10} maxLength={8000} rows={8} value={edit.content} onChange={e => setEdit({ ...edit, content: e.target.value })} /><Input aria-label="Fonte conoscenza" type="url" placeholder="Fonte https://…" value={edit.source_url ?? ''} onChange={e => setEdit({ ...edit, source_url: e.target.value || null })} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.active} onChange={e => setEdit({ ...edit, active: e.target.checked })} />Attiva</label><Button type="submit" disabled={busy}><Save className="mr-2 h-4 w-4" />Salva</Button></form>}</DialogContent></Dialog>
  </div>;
}