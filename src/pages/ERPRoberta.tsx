import { useCallback, useState } from 'react';
import { useSearchParams } from '@/lib/router-compat';
import { Megaphone, Mail, Share2, Target, MessageSquarePlus, Trash2, CalendarClock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SEOHead from '@/components/SEOHead';
import { cn } from '@/lib/utils';
import { BrunoAgentChat, type AgentConfig } from '@/components/erp/BrunoAgentChat';
import { loadThreads, newThread, saveThreads, type BrunoThread } from '@/lib/brunoThreads';
import ERPNewsletter from './ERPNewsletter';

const KEY = 'roberta-agent-threads';
const ROBERTA: AgentConfig = {
  fn: 'roberta-chat', name: 'Roberta', icon: Megaphone, instructionsKey: 'roberta-agent-instructions',
  description: 'Conosce i prodotti, le foto e i contenuti reali Vesuviano. Chiedi idee per newsletter, post social e campagne Ads.',
  suggestions: [
    'Proponi il tema della prossima newsletter',
    'Scrivi 3 post Instagram sul Real Bosco',
    'Idee di campagna Meta per pizzerie in UK',
    'Quali occasioni speciali arrivano nel prossimo mese?',
  ],
};

const sections = [
  { id: 'newsletter', icon: Mail, title: 'Campagne newsletter', desc: 'Bozze quindicinali e occasioni speciali', ready: true },
  { id: 'social', icon: Share2, title: 'Post social', desc: 'In arrivo', ready: false },
  { id: 'ads', icon: Target, title: 'Campagne Meta / Ads', desc: 'In arrivo', ready: false },
];

export default function ERPRoberta() {
  const [params, setParams] = useSearchParams();
  const view = params.get('view');
  const [threads, setThreads] = useState<BrunoThread[]>(() => {
    const t = loadThreads(KEY); if (t.length) return t;
    const first = [newThread()]; saveThreads(first, KEY); return first;
  });
  const activeThread = threads.find((t) => t.id === params.get('chat')) ?? threads[0];
  const openThread = (id: string) => setParams(() => new URLSearchParams({ chat: id }));
  const updateThread = useCallback((t: BrunoThread) => setThreads((prev) => {
    const next = [t, ...prev.filter((x) => x.id !== t.id)]; saveThreads(next, KEY); return next;
  }), []);
  const createThread = () => { const t = newThread(); setThreads((prev) => { const next = [t, ...prev]; saveThreads(next, KEY); return next; }); openThread(t.id); };
  const deleteThread = (id: string) => setThreads((prev) => { let next = prev.filter((x) => x.id !== id); if (!next.length) next = [newThread()]; saveThreads(next, KEY); return next; });

  return (
    <div className="bruno-workspace flex h-[calc(100dvh-3.5rem)] min-h-0 w-full min-w-0 flex-col overflow-hidden bg-background text-foreground">
      <SEOHead title="Roberta AI | ERP" description="Marketing Manager AI" />
      <div className={cn('flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3', view && 'hidden md:flex')}>
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-semibold"><Megaphone className="h-5 w-5 text-primary" />Roberta <span className="text-sm font-normal text-muted-foreground">Marketing Manager</span></h1>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary" className="gap-1"><CalendarClock className="h-3 w-3" />Ogni 15 giorni + occasioni</Badge>
          <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" />Invio solo dopo approvazione</Badge>
        </div>
      </div>
      <div className="grid min-h-0 min-w-0 flex-1 overflow-hidden md:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className={cn('flex min-h-0 min-w-0 flex-col overflow-y-auto border-r', view && 'hidden md:flex')}>
          <div className={cn('m-3 shrink-0 rounded-xl border p-2', !view ? 'border-primary' : 'border-border')}>
            <p className="flex items-center gap-1.5 px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-primary"><Megaphone className="h-3.5 w-3.5" />Agente</p>
            <Button className="w-full" onClick={createThread}><MessageSquarePlus className="mr-2 h-4 w-4" />Nuova chat</Button>
            <div className="mt-1.5 max-h-48 space-y-1 overflow-y-auto">
              {threads.map((t) => (
                <div key={t.id} className={cn('group flex items-center rounded-lg', !view && activeThread?.id === t.id ? 'bg-muted' : 'hover:bg-muted/60')}>
                  <button type="button" onClick={() => openThread(t.id)} className="min-w-0 flex-1 px-3 py-2 text-left">
                    <span className="block truncate text-sm">{t.title}</span>
                    <span className="block text-[11px] text-muted-foreground">{new Date(t.updatedAt).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </button>
                  <button type="button" aria-label="Elimina conversazione" onClick={() => deleteThread(t.id)} className="mr-1 rounded p-1.5 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
          <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attività marketing</p>
          {sections.map((s) => (
            <button key={s.id} type="button" disabled={!s.ready} onClick={() => setParams(() => new URLSearchParams({ view: s.id }))}
              className={cn('flex items-start gap-3 border-b border-l-[3px] border-l-transparent px-4 py-3 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60', view === s.id && 'border-l-primary bg-accent/60')}>
              <s.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0"><span className="block text-sm font-semibold">{s.title}</span><span className="block text-xs text-muted-foreground">{s.desc}</span></span>
            </button>
          ))}
        </div>
        <div className={cn('flex min-h-0 min-w-0 flex-col overflow-hidden', !view && 'hidden md:flex')}>
          {view === 'newsletter' ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <Button variant="ghost" size="sm" className="mb-2 md:hidden" onClick={() => setParams(() => new URLSearchParams())}>← Indietro</Button>
              <ERPNewsletter embedded />
            </div>
          ) : activeThread ? (
            <BrunoAgentChat key={activeThread.id} thread={activeThread} onChange={updateThread} agent={ROBERTA} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
