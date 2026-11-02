import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Radar, MessageSquarePlus, Trash2, Search, ShieldAlert, Store, Handshake, Workflow, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import SEOHead from '@/components/SEOHead';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { BrunoAgentChat, type AgentConfig } from '@/components/erp/BrunoAgentChat';
import { loadThreads, newThread, saveThreads, type BrunoThread } from '@/lib/brunoThreads';
import { MarioOperations } from '@/components/erp/MarioOperations';

const KEY = 'mario-agent-threads';
const MARIO: AgentConfig = {
  fn: 'mario-chat', name: 'Mario', icon: Radar, instructionsKey: 'mario-agent-instructions',
  description: 'Outbound Partnership & Customers: trova pizzerie e aziende Horeca in UK, Francia e Germania e gestisce le sequenze email.',
  suggestions: [
    'Cerca 5 pizzerie a Londra e salva i candidati da verificare',
    'Quanti partner hanno risposto questa settimana?',
    'Scrivi l’email di avvio per un distributore Horeca francese',
    'Come sta andando la sequenza in UK?',
  ],
};

interface Prospect { id: string; kind: string; name: string; country: string; city: string | null; email: string | null; website: string | null; status: string; step: number; summary: string | null; replied_at: string | null; created_at: string; qualified: boolean; qualification_reason: string | null }
interface Settings { paused: boolean; daily_limit: number; send_markets: string[]; sender_email: string | null; pause_reason: string | null }
const db = supabase as any;
const STATUS: Record<string, string> = { new: 'Da contattare', sequence: 'In sequenza', replied: 'Ha risposto', unsubscribed: 'Disiscritto', bounced: 'Rimbalzato', manual: 'Contatto manuale', done: 'Sequenza finita' };

export default function ERPMario() {
  const [params, setParams] = useSearchParams();
  const prospectId = params.get('prospect');
  const section = params.get('section');
  const [threads, setThreads] = useState<BrunoThread[]>(() => {
    const t = loadThreads(KEY); if (t.length) return t;
    const first = [newThread()]; saveThreads(first, KEY); return first;
  });
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('all');
  const [country, setCountry] = useState('all');

  const [loadError, setLoadError] = useState('');
  const refresh = useCallback(async () => {
    const rows: Prospect[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await db.from('outreach_prospects').select('id,kind,name,country,city,email,website,status,step,summary,replied_at,created_at,qualified,qualification_reason').order('created_at', { ascending: false }).order('id').range(offset, offset + 499);
      if (error) { setLoadError('Impossibile caricare i prospect.'); return; }
      rows.push(...(data ?? [])); if (!data || data.length < 500) break;
    }
    setProspects(rows); setLoadError('');
    db.from('outreach_settings').select('paused,daily_limit,send_markets,sender_email,pause_reason').eq('key', 'default').maybeSingle().then(({ data }: any) => setSettings(data));
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const activeThread = threads.find((t) => t.id === params.get('chat')) ?? threads[0];
  const openThread = (id: string) => setParams(() => new URLSearchParams({ chat: id }));
  const updateThread = useCallback((t: BrunoThread) => setThreads((prev) => {
    const next = [t, ...prev.filter((x) => x.id !== t.id)]; saveThreads(next, KEY); return next;
  }), []);
  const createThread = () => { const t = newThread(); setThreads((prev) => { const next = [t, ...prev]; saveThreads(next, KEY); return next; }); openThread(t.id); };
  const deleteThread = (id: string) => setThreads((prev) => { let next = prev.filter((x) => x.id !== id); if (!next.length) next = [newThread()]; saveThreads(next, KEY); return next; });

  const filtered = useMemo(() => prospects.filter((p) =>
    (kind === 'all' || p.kind === kind) && (country === 'all' || p.country === country) &&
    (!q || `${p.name} ${p.city ?? ''} ${p.email ?? ''}`.toLowerCase().includes(q.toLowerCase()))), [prospects, q, kind, country]);
  const selected = prospects.find((p) => p.id === prospectId);

  return (
    <div className="bruno-workspace flex h-[calc(100dvh-3.5rem)] min-h-0 w-full min-w-0 flex-col overflow-hidden bg-background text-foreground">
      <SEOHead title="Mario AI | ERP" description="Outbound Partnership & Customers" />
      <div className={cn('flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3', prospectId && 'hidden md:flex')}>
        <h1 className="flex items-center gap-2 text-xl font-semibold"><Radar className="h-5 w-5 text-primary" />Mario <span className="text-sm font-normal text-muted-foreground">Outbound Partnership & Customers</span></h1>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {settings && <Badge variant="secondary">{settings.daily_limit} nuovi contatti/giorno · invio {settings.send_markets.join(', ')}</Badge>}
          <Badge variant="secondary" className="gap-1"><ShieldAlert className="h-3 w-3" />Germania: solo contatto manuale</Badge>
          <Badge variant="secondary">Ricerca e bozze · invii non attivati</Badge>
        </div>
      </div>
      {settings?.paused && (
        <p className="shrink-0 border-b bg-muted px-4 py-2 text-xs text-muted-foreground">
          Invii in pausa{settings.sender_email ? (settings.pause_reason ? `: ${settings.pause_reason}` : '') : ': manca la casella mittente dedicata.'}
        </p>
      )}
      <div className="grid min-h-0 min-w-0 flex-1 overflow-hidden md:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className={cn('flex min-h-0 min-w-0 flex-col overflow-hidden border-r', (prospectId || section) && 'hidden md:flex')}>
          <div className={cn('m-3 shrink-0 rounded-xl border p-2', !prospectId ? 'border-primary' : 'border-border')}>
            <p className="flex items-center gap-1.5 px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-primary"><Radar className="h-3.5 w-3.5" />Agente</p>
            <Button className="w-full" onClick={createThread}><MessageSquarePlus className="mr-2 h-4 w-4" />Nuova chat</Button>
            <div className="mt-1.5 max-h-40 space-y-1 overflow-y-auto">
              {threads.map((t) => (
                <div key={t.id} className={cn('group flex items-center rounded-lg', !prospectId && activeThread?.id === t.id ? 'bg-muted' : 'hover:bg-muted/60')}>
                  <button type="button" onClick={() => openThread(t.id)} className="min-w-0 flex-1 px-3 py-2 text-left">
                    <span className="block truncate text-sm">{t.title}</span>
                    <span className="block text-[11px] text-muted-foreground">{new Date(t.updatedAt).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </button>
                  <button type="button" aria-label="Elimina conversazione" onClick={() => deleteThread(t.id)} className="mr-1 rounded p-1.5 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2 px-3 pb-3">
            <Button size="sm" variant="outline" onClick={() => setParams({ section: 'research' })}><Workflow className="mr-1.5 h-4 w-4" />Operazioni</Button>
            <Button size="sm" variant="outline" onClick={() => setParams({ section: 'knowledge' })}><BookOpen className="mr-1.5 h-4 w-4" />Conoscenze</Button>
          </div>
          <div className="shrink-0 space-y-2 px-3 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prospect · {filtered.length}</p>
            <div className="relative"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca nome, città, email" className="h-8 pl-8 text-sm" /></div>
            <div className="flex gap-2">
              <select aria-label="Tipo" value={kind} onChange={(e) => setKind(e.target.value)} className="h-8 flex-1 rounded-md border bg-background px-2 text-xs">
                <option value="all">Tutti i tipi</option><option value="pizzeria">Pizzerie</option><option value="partner">Partner Horeca</option>
              </select>
              <select aria-label="Paese" value={country} onChange={(e) => setCountry(e.target.value)} className="h-8 flex-1 rounded-md border bg-background px-2 text-xs">
                <option value="all">Tutti i paesi</option><option value="UK">UK</option><option value="FR">Francia</option><option value="DE">Germania</option>
              </select>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadError && <p role="alert" className="px-4 py-3 text-xs text-destructive">{loadError}</p>}
            {filtered.length === 0 && <p className="px-4 py-6 text-center text-xs text-muted-foreground">Nessun prospect trovato.</p>}
            {filtered.map((p) => (
              <button key={p.id} type="button" onClick={() => setParams(() => new URLSearchParams({ prospect: p.id }))}
                className={cn('flex w-full items-start gap-3 border-b border-l-[3px] border-l-transparent px-4 py-2.5 text-left hover:bg-muted', prospectId === p.id && 'border-l-primary bg-accent/60')}>
                {p.kind === 'partner' ? <Handshake className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <Store className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{p.city ?? '—'} · {p.country} · {STATUS[p.status] ?? p.status}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className={cn('flex min-h-0 min-w-0 flex-col overflow-hidden', !prospectId && !section && 'hidden md:flex')}>
          {section ? <div className="min-h-0 flex-1 overflow-y-auto p-5"><Button variant="ghost" size="sm" onClick={() => setParams({})}>← Torna a Mario</Button><MarioOperations key={section} initialTab={section} onUpdated={() => void refresh()} /></div> : selected ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              <Button variant="ghost" size="sm" onClick={() => setParams(() => new URLSearchParams())}>← Torna a Mario</Button>
              <div>
                <h2 className="text-lg font-semibold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">{selected.kind === 'partner' ? 'Partner Horeca' : 'Pizzeria'} · {selected.city ?? '—'}, {selected.country}</p>
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">Email: </span>{selected.email ?? '—'}</p>
                <p className="truncate"><span className="text-muted-foreground">Sito: </span>{selected.website ? <a href={selected.website} target="_blank" rel="noreferrer" className="text-primary underline">{selected.website}</a> : '—'}</p>
                <p><span className="text-muted-foreground">Stato: </span>{STATUS[selected.status] ?? selected.status}</p>
                <p><span className="text-muted-foreground">Email inviate: </span>{selected.step} / 3</p>
              </div>
              {selected.summary && <p className="rounded-lg border bg-muted/40 p-3 text-sm">{selected.summary}</p>}
              <Badge variant="secondary">{selected.qualified ? 'Pertinenza verificata' : 'Da verificare'}</Badge>
              {selected.qualification_reason && <p className="text-sm text-muted-foreground">{selected.qualification_reason}</p>}
              <MarioOperations key={selected.id} prospectId={selected.id} onUpdated={() => void refresh()} />
            </div>
          ) : activeThread ? (
            <BrunoAgentChat key={activeThread.id} thread={activeThread} onChange={updateThread} agent={{ ...MARIO, onInstructions: () => setParams({ section: 'instructions' }), onComplete: () => void refresh() }} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
