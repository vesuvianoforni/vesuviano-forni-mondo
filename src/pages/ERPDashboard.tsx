import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ArrowRight, Bot, CalendarDays, CheckCheck, Clock3, FileText, Flame, Mail, Megaphone, Package, RefreshCw, TrendingUp, Truck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '@/components/SEOHead';
import { useERPDashboard } from '@/hooks/useERPDashboard';
import { summarizeDashboardLeads } from '@/lib/erpDashboard';
import { activityLabels } from '@/lib/crmActivity';

const shortcuts = [
  { title: 'CRM', label: 'Clienti e trattative', icon: Users, tone: 'text-accent bg-accent/10', url: '/erp/crm' },
  { title: 'Pro-Forma', label: 'Preventivi', icon: FileText, tone: 'text-primary bg-primary/10', url: '/erp/proforma' },
  { title: 'Offerte commerciali', label: 'Preventivatore Vesuviano', icon: FileText, tone: 'text-accent bg-accent/10', url: '/erp/offerte' },
  { title: 'Ordini', label: 'Produzione e spedizioni', icon: Truck, tone: 'text-secondary bg-secondary/10', url: '/erp/ordini' },
  { title: 'Link Configuratore', label: 'Sessioni clienti', icon: TrendingUp, tone: 'text-accent bg-accent/10', url: '/erp/sessioni-configuratore' },
  { title: 'Bruno AI', label: 'Sales & back-office', icon: Bot, tone: 'text-accent bg-accent/10', url: '/erp/bruno' },
  { title: 'Roberta AI', label: 'Marketing e newsletter', icon: Megaphone, tone: 'text-secondary bg-secondary/10', url: '/erp/roberta' },
  { title: 'Forni', label: 'Catalogo forni', icon: Flame, tone: 'text-primary bg-primary/10', url: '/erp/forni' },
  { title: 'Bruciatori', label: 'Catalogo bruciatori', icon: Package, tone: 'text-secondary bg-secondary/10', url: '/erp/bruciatori' },
];
const stageTones = ['text-muted-foreground', 'text-accent', 'text-secondary', 'text-primary', 'text-secondary', 'text-destructive'];
const number = new Intl.NumberFormat('it-IT');
const activityIcons: Record<string, typeof Clock3> = { call: Clock3, email: Mail, meeting: CalendarDays };

function DataUnavailable({ onRetry }: { onRetry: () => void }) {
  return <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground" role="status">
    <span>Dati non disponibili</span>
    <Button size="sm" variant="ghost" onClick={onRetry}><RefreshCw className="h-3 w-3" />Riprova</Button>
  </div>;
}

const ERPDashboard = () => {
  const { leads, production, drafts } = useERPDashboard();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const summary = useMemo(() => summarizeDashboardLeads(leads.data ?? [], now), [leads.data, now]);
  const isRefreshing = leads.isFetching || production.isFetching || drafts.isFetching;
  const updatedAt = Math.max(leads.dataUpdatedAt, production.dataUpdatedAt, drafts.dataUpdatedAt);
  const refresh = () => { void leads.refetch(); void production.refetch(); void drafts.refetch(); };
  const metrics = [
    { label: 'Lead attivi', value: summary.activeCount, note: 'Pipeline Vesuviano', icon: Users, tone: 'text-accent bg-accent/10', url: '/erp/crm', query: leads },
    { label: 'Attività scadute', value: summary.overdueCount, note: `${summary.todayCount} in agenda oggi`, icon: Clock3, tone: 'text-destructive bg-destructive/10', url: '/erp/crm', query: leads },
    { label: 'Ordini in produzione', value: production.data, note: 'Produzione in corso', icon: Truck, tone: 'text-secondary bg-secondary/10', url: '/erp/ordini', query: production },
    { label: 'Newsletter in bozza', value: drafts.data, note: 'In attesa di approvazione', icon: Mail, tone: 'text-primary bg-primary/10', url: '/erp/newsletter', query: drafts },
  ];

  return (
    <>
      <SEOHead title="ERP Dashboard | Vesuviano" description="Dashboard gestionale Vesuviano." lang="it" noIndex />
      <div className="erp-dashboard min-h-full bg-background text-foreground">
        <div className="mx-auto w-full max-w-[1440px] space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="capitalize">{format(now, 'EEEE d MMMM yyyy', { locale: it })}</span>
              </p>
              <h1 className="text-3xl font-semibold">Dashboard</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Il punto su vendite, attività e produzione.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" aria-label="Aggiorna dashboard" title="Aggiorna dashboard" disabled={isRefreshing} onClick={refresh}>
                <RefreshCw className={isRefreshing ? 'motion-safe:animate-spin' : ''} />
              </Button>
              <Button asChild><Link to="/erp/crm">Apri CRM<ArrowUpRight /></Link></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(metric => <div key={metric.label} className="relative min-w-0 rounded-lg border border-border bg-card p-5 text-card-foreground">
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{metric.label}</span>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${metric.tone}`}><metric.icon className="h-[18px] w-[18px]" /></span>
              </div>
              {metric.query.isPending ? <Skeleton className="mb-2 h-9 w-16 bg-muted" /> : metric.query.isError ? <DataUnavailable onRetry={() => void metric.query.refetch()} /> :
                <p className="text-3xl font-semibold tabular-nums">{number.format(metric.value ?? 0)}</p>}
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{metric.query.isError && metric.url === '/erp/crm' ? 'Riepilogo non disponibile' : metric.note}</p>
                <Button asChild size="icon" variant="ghost" className="h-7 w-7 shrink-0 hover:bg-muted hover:text-foreground" title={`Apri ${metric.label}`}><Link to={metric.url} aria-label={`Apri ${metric.label}`}><ArrowUpRight /></Link></Button>
              </div>
            </div>)}
          </div>

          <div className="grid grid-cols-1 border-y border-border lg:grid-cols-2">
            <div className="min-w-0 py-6 lg:border-r lg:border-border lg:pr-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div><h2 className="text-base font-semibold">Pipeline commerciale</h2><p className="mt-1 text-xs text-muted-foreground">Vesuviano · lead non archiviati</p></div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              {leads.isPending ? <div className="space-y-5">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-7 w-full bg-muted" />)}</div> : leads.isError ? <DataUnavailable onRetry={() => void leads.refetch()} /> :
                <div className="space-y-4">
                  {summary.stages.map((stage, index) => <div key={stage.id} className="grid grid-cols-[132px_1fr_48px] items-center gap-3 sm:grid-cols-[148px_1fr_56px]">
                    <span className="flex items-center gap-2.5 text-sm"><span className={`h-2 w-2 shrink-0 rounded-full bg-current ${stageTones[index]}`} />{stage.title}</span>
                    <progress className={`erp-pipeline-progress w-full ${stageTones[index]}`} value={stage.count} max={Math.max(1, ...summary.stages.map(item => item.count))} aria-label={`${stage.title}: ${stage.count} lead`} />
                    <span className="text-right text-sm font-semibold tabular-nums">{number.format(stage.count)}</span>
                  </div>)}
                  <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground"><span>Totale lead</span><span className="font-semibold tabular-nums text-foreground">{number.format(summary.stages.reduce((sum, stage) => sum + stage.count, 0))}</span></div>
                </div>}
            </div>
            <div className="min-w-0 border-t border-border py-6 lg:border-t-0 lg:pl-7">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div><h2 className="text-base font-semibold">Agenda commerciale</h2><p className="mt-1 text-xs text-muted-foreground">Prossime attività · scadute per prime</p></div>
                <Button asChild variant="ghost" size="sm" className="h-8 text-muted-foreground hover:bg-muted hover:text-foreground"><Link to="/erp/crm">CRM<ArrowRight /></Link></Button>
              </div>
              {leads.isPending ? <div className="space-y-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-14 w-full bg-muted" />)}</div> : leads.isError ? <DataUnavailable onRetry={() => void leads.refetch()} /> : summary.activities.length === 0 ?
                <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center"><CheckCheck className="h-7 w-7 text-secondary" /><p className="text-sm font-medium">Nessuna attività programmata</p><Button asChild size="sm" variant="outline"><Link to="/erp/crm">Apri CRM<ArrowRight /></Link></Button></div> :
                <div className="divide-y divide-border">
                  {summary.activities.slice(0, 5).map(({ lead, timing }) => {
                    const Icon = activityIcons[lead.next_activity_type ?? ''] ?? Clock3;
                    return <Button asChild variant="ghost" key={lead.id} className="h-auto w-full justify-start whitespace-normal rounded-none px-0 py-3 text-left hover:bg-muted hover:text-foreground">
                      <Link to={`/erp/crm?lead=${encodeURIComponent(lead.id)}`}>
                        <span className={`mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${timing.state === 'overdue' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}`}><Icon className="h-4 w-4" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{lead.company_name || lead.contact_name || 'Contatto senza nome'}</span>
                          <span className={`mt-1 block text-xs font-normal ${timing.state === 'overdue' ? 'text-destructive' : 'text-muted-foreground'}`}>{activityLabels[lead.next_activity_type ?? ''] || 'Attività'} · {timing.label}</span>
                        </span>
                        <ArrowUpRight className="ml-1 text-muted-foreground" />
                      </Link>
                    </Button>;
                  })}
                </div>}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-base font-semibold">Accessi rapidi</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {shortcuts.map(item => <Button asChild variant="outline" key={item.title} className="group h-auto min-h-24 justify-start gap-3 whitespace-normal rounded-lg border-border bg-card px-4 py-4 text-left text-card-foreground hover:border-muted-foreground/50 hover:bg-card hover:text-card-foreground">
                <Link to={item.url}>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${item.tone}`}><item.icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{item.label}</span></span>
                  <ArrowUpRight className="shrink-0 text-muted-foreground group-hover:text-foreground" />
                </Link>
              </Button>)}
            </div>
          </div>
          <p className="text-right text-xs text-muted-foreground" role="status">{isRefreshing ? 'Aggiornamento in corso…' : updatedAt ? `Ultimo aggiornamento · ${format(updatedAt, 'HH:mm')}` : 'In attesa dei dati'}</p>
        </div>
      </div>
    </>
  );
};

export default ERPDashboard;
