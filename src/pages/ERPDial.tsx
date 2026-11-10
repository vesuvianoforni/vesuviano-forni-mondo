import { useEffect, useMemo, useState } from 'react';
import { Loader2, PhoneCall, Search, UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DialPad } from '@/components/erp/DialPad';
import { DialHistory } from '@/components/erp/DialHistory';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CRMCallButton } from '@/components/erp/CRMCallProvider';
import type { CRMLead } from '@/components/erp/CRMLeadCard';
import { ACTIVE_CRM_STAGES, CRM_STAGES } from '@/lib/crmPipeline';
import { useSearchParams } from '@/lib/router-compat';

type Filter = 'oggi' | 'tutti' | string;
const stageLabel = (id: string) => CRM_STAGES.find(s => s.id === id)?.title ?? id;

export default function ERPDial() {
  const [params] = useSearchParams();
  const selectedLead = params.get('lead');
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'tastierino' | 'clienti' | 'storico'>('tastierino'), [query, setQuery] = useState(''), [filter, setFilter] = useState<Filter>('oggi');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all: CRMLead[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase.from('leads')
          .select('id,company_name,contact_name,phone,email,status,city,country,next_activity_type,next_activity_date,next_activity_notes,created_at,updated_at')
          .not('phone', 'is', null).neq('phone', '')
          .order('updated_at', { ascending: false }).order('id').range(from, from + 999);
        if (error) { if (!cancelled) setError(error.message); break; }
        all.push(...((data ?? []) as unknown as CRMLead[]));
        if (!data || data.length < 1000) break;
      }
      if (!cancelled) { setLeads(all); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedLead || !leads.length) return;
    const lead = leads.find(l => l.id === selectedLead);
    if (!lead) return;
    setTab('clienti'); setFilter('tutti'); setQuery(lead.phone || lead.contact_name || lead.company_name || '');
  }, [selectedLead, leads]);

  const endOfToday = useMemo(() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); }, []);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, '');
    return leads.filter(l => {
      if (filter === 'oggi') { if (!l.next_activity_date || new Date(l.next_activity_date).getTime() > endOfToday) return false; }
      else if (filter !== 'tutti' && l.status !== filter) return false;
      if (!q) return true;
      const text = [l.company_name, l.contact_name, l.city, l.country, l.email].join(' ').toLowerCase();
      return text.includes(q) || (digits.length >= 3 && (l.phone ?? '').replace(/\D/g, '').includes(digits));
    }).sort((a, b) => filter === 'oggi'
      ? new Date(a.next_activity_date ?? 0).getTime() - new Date(b.next_activity_date ?? 0).getTime() : 0).slice(0, 200);
  }, [leads, query, filter, endOfToday]);

  const chips: { id: Filter; label: string }[] = [
    { id: 'oggi', label: 'Da chiamare oggi' }, { id: 'tutti', label: 'Tutti' },
    ...ACTIVE_CRM_STAGES.map(s => ({ id: s.id, label: s.title })),
  ];

  return <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-4 p-3 sm:p-6">
    <header className="flex items-center gap-3">
      <PhoneCall className="h-6 w-6 text-primary" />
      <div><h1 className="text-xl font-semibold sm:text-2xl">Dial</h1>
        <p className="text-sm text-muted-foreground">Scegli il cliente e chiama con Bruno AI o direttamente dal numero UK.</p></div>
    </header>
    <Tabs value={tab} onValueChange={v => setTab(v as 'tastierino' | 'clienti' | 'storico')}>
      <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="tastierino">Tastierino</TabsTrigger><TabsTrigger value="clienti">Clienti</TabsTrigger><TabsTrigger value="storico">Storico</TabsTrigger></TabsList>
    </Tabs>
    {tab === 'storico' ? <DialHistory leads={leads} />
    : tab === 'tastierino' ? <DialPad leads={leads} onLeadCreated={l => setLeads(prev => [l, ...prev])} /> : <>
    <div className="sticky top-0 z-10 -mx-3 space-y-2 bg-background/95 px-3 py-2 backdrop-blur sm:mx-0 sm:px-0">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cerca nome, azienda, città o numero"
          className="h-12 pl-9 text-base" inputMode="search" aria-label="Cerca cliente" /></div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {chips.map(c => <Button key={c.id} size="sm" variant={filter === c.id ? 'default' : 'outline'}
          className="shrink-0 rounded-full" onClick={() => setFilter(c.id)}>{c.label}</Button>)}
      </div>
    </div>
    {loading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
      : error ? <p className="text-sm text-destructive">Impossibile caricare i clienti: {error}</p>
      : visible.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">{filter === 'oggi' ? 'Nessuna chiamata in programma per oggi.' : 'Nessun cliente trovato.'}</p>
      : <ul className="divide-y rounded-lg border">
        {visible.map(l => {
          const name = l.contact_name || l.company_name || l.phone;
          const due = l.next_activity_date ? new Date(l.next_activity_date) : null;
          return <li key={l.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{name}</p>
              {l.company_name && l.contact_name && <p className="truncate text-xs text-muted-foreground">{l.company_name}</p>}
              <p className="truncate text-sm text-muted-foreground">{l.phone}{l.city ? ` · ${l.city}` : ''}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge variant="outline">{stageLabel(l.status)}</Badge>
                {due && <Badge variant={due.getTime() < Date.now() ? 'destructive' : 'secondary'}>
                  {due.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</Badge>}
              </div>
            </div>
            <Button asChild size="icon" variant="ghost" className="h-11 w-11 shrink-0" aria-label={`Apri scheda ${name}`}>
              <a href={`/erp/crm?lead=${encodeURIComponent(l.id)}`}><UserRound className="h-5 w-5" /></a></Button>
            <div className="shrink-0 [&_button]:h-11 [&_button]:px-4"><CRMCallButton lead={l} /></div>
          </li>;
        })}
      </ul>}
    </>}
  </div>;
}
