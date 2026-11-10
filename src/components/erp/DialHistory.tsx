import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Bot, Loader2, PhoneCall, PhoneForwarded, RefreshCw, UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BrunoCallDetail } from '@/components/erp/BrunoCallDetail';
import { DirectCallDetail } from '@/components/erp/DirectCallDetail';
import type { CRMLead } from '@/components/erp/CRMLeadCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fullPhoneIdentity, filterDialDirections, type DialDirectionFilter } from '@/lib/dialHistory';

type CallRow = {
  id: string;
  kind: 'direct' | 'ai' | 'forward';
  leadId: string | null;
  destination: string;
  direction: 'outbound' | 'inbound';
  status: string;
  at: string;
  durationSec: number | null;
  summary: string | null;
  objective: string | null;
  forwardedTo?: string;
  receivedNumber?: string;
};

const STATUS_LABEL: Record<string, string> = {
  completed: 'Completata', ended: 'Terminata', failed: 'Non riuscita', unknown: 'Esito incerto',
  cancelled: 'Annullata', proposed: 'Proposta', starting: 'In avvio', dialing: 'In composizione',
  active: 'In corso', preparing: 'In preparazione',
  received: 'Ricevuta', ringing: 'Fisso in chiamata', answered: 'Risposta dal fisso', missed: 'Persa', busy: 'Fisso occupato',
};

const fmtDuration = (sec: number | null) => {
  if (sec == null || sec < 0) return null;
  const m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

export function DialHistory({ leads }: { leads: CRMLead[] }) {
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiCallId, setAiCallId] = useState<string | null>(null);
  const [directCall, setDirectCall] = useState<CallRow | null>(null);
  const [forwardCall, setForwardCall] = useState<CallRow | null>(null);
  const [filter, setFilter] = useState<DialDirectionFilter>('all');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      const [direct, voice, incoming] = await Promise.all([
        supabase.from('crm_direct_calls')
          .select('id,lead_id,destination,status,created_at,answered_at,ended_at,summary')
          .order('created_at', { ascending: false }).limit(200),
        supabase.from('bruno_voice_calls')
          .select('id,lead_id,destination,direction,status,objective,summary,created_at,started_at,ended_at')
          .order('created_at', { ascending: false }).limit(200),
        supabase.from('crm_inbound_calls')
          .select('id,lead_id,caller_number,received_number,forwarded_to,status,created_at,duration_seconds')
          .order('created_at', { ascending: false }).limit(200),
      ]);
      if (cancelled) return;
      const err = direct.error ?? voice.error ?? incoming.error;
      if (err) { setError(err.message); setLoading(false); return; }
      const rows: CallRow[] = [
        ...(direct.data ?? []).map(c => ({
          id: `d-${c.id}`, kind: 'direct' as const, leadId: c.lead_id, destination: c.destination,
          direction: 'outbound' as const, status: c.status, at: c.created_at,
          durationSec: c.answered_at && c.ended_at
            ? (new Date(c.ended_at).getTime() - new Date(c.answered_at).getTime()) / 1000 : null,
          summary: c.summary ?? null, objective: null,
        })),
        ...(voice.data ?? []).map(c => ({
          id: `v-${c.id}`, kind: 'ai' as const, leadId: c.lead_id, destination: c.destination,
          direction: (c.direction === 'inbound' ? 'inbound' : 'outbound') as 'outbound' | 'inbound',
          status: c.status, at: c.created_at,
          durationSec: c.started_at && c.ended_at
            ? (new Date(c.ended_at).getTime() - new Date(c.started_at).getTime()) / 1000 : null,
          summary: c.summary ?? null, objective: c.objective ?? null,
        })),
        ...(incoming.data ?? []).map(c => ({
          id: `f-${c.id}`, kind: 'forward' as const, leadId: c.lead_id, destination: c.caller_number,
          direction: 'inbound' as const, status: c.status, at: c.created_at, durationSec: c.duration_seconds,
          summary: null, objective: null, forwardedTo: c.forwarded_to, receivedNumber: c.received_number,
        })),
      ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
      setCalls(rows); setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [reload]);

  const leadById = useMemo(() => new Map(leads.map(l => [l.id, l])), [leads]);
  const leadByPhone = useMemo(() => {
    const map = new Map<string, CRMLead | null>();
    for (const lead of leads) {
      const phone = fullPhoneIdentity(lead.phone);
      if (phone) map.set(phone, map.has(phone) ? null : lead);
    }
    return map;
  }, [leads]);
  const findLead = (call: CallRow) => call.leadId ? leadById.get(call.leadId) : leadByPhone.get(fullPhoneIdentity(call.destination) ?? '');
  const shown = filterDialDirections(calls, filter);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (error) return <p className="text-sm text-destructive">Impossibile caricare lo storico: {error}</p>;
  if (calls.length === 0) return <p className="py-10 text-center text-sm text-muted-foreground">Nessuna chiamata registrata.</p>;

  return <>
    <div className="mb-3 flex items-center gap-2">
      <Tabs value={filter} onValueChange={value => setFilter(value as DialDirectionFilter)} className="min-w-0 flex-1">
        <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="all">Tutte</TabsTrigger><TabsTrigger value="outbound">In uscita</TabsTrigger><TabsTrigger value="inbound">Ricevute</TabsTrigger></TabsList>
      </Tabs>
      <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" onClick={() => setReload(v => v + 1)} aria-label="Aggiorna storico" title="Aggiorna storico"><RefreshCw className="h-4 w-4" /></Button>
    </div>
    {shown.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nessuna chiamata {filter === 'inbound' ? 'ricevuta' : 'in uscita'} registrata.</p>}
    <ul className="divide-y rounded-lg border">
    {shown.map(c => {
      const lead = findLead(c);
      const name = lead?.contact_name || lead?.company_name || c.destination;
      const dur = fmtDuration(c.durationSec);
      const DirIcon = c.direction === 'inbound' ? ArrowDownLeft : ArrowUpRight;
      const open = () => { if (c.kind === 'ai') setAiCallId(c.id.slice(2)); else if (c.kind === 'forward') setForwardCall(c); else setDirectCall(c); };
      return <li key={c.id}>
        <div role="button" tabIndex={0} onClick={open} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
          className="flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Apri dettaglio chiamata con ${name}`}>
        <div className="mt-1 shrink-0 rounded-full bg-muted p-2">
          {c.kind === 'ai' ? <Bot className="h-4 w-4" /> : c.kind === 'forward' ? <PhoneForwarded className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name}</p>
          <p className="truncate text-sm text-muted-foreground">
            <DirIcon className="mr-1 inline h-3.5 w-3.5" />
            {c.destination} · {new Date(c.at).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            {dur ? ` · ${dur}` : ''}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="outline">{c.kind === 'ai' ? 'Bruno AI' : c.kind === 'forward' ? 'Ricevuta · inoltro' : 'Diretta'}</Badge>
            <Badge variant={['failed','missed','busy'].includes(c.status) ? 'destructive' : 'secondary'}>{c.kind === 'forward' && c.status === 'completed' ? 'Terminata · risposta dal fisso' : c.kind === 'forward' && c.status === 'unknown' ? 'Risposta non confermata' : STATUS_LABEL[c.status] ?? c.status}</Badge>
            {c.objective && <Badge variant="outline">{c.objective}</Badge>}
          </div>
          {c.forwardedTo && <p className="mt-1 break-words text-xs text-muted-foreground">Inoltro al numero aziendale {c.forwardedTo}</p>}
          {c.summary && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.summary}</p>}
        </div>
        {lead && <Button asChild size="icon" variant="ghost" className="h-11 w-11 shrink-0" aria-label={`Apri scheda ${name}`}
          onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
          <a href={`/erp/crm?lead=${encodeURIComponent(lead.id)}`}><UserRound className="h-5 w-5" /></a></Button>}
        </div>
      </li>;
    })}
    </ul>
    <BrunoCallDetail callId={aiCallId} onClose={() => setAiCallId(null)} />
    <DirectCallDetail callId={directCall?.id.slice(2) ?? null} onClose={() => setDirectCall(null)} />
    <Dialog open={Boolean(forwardCall)} onOpenChange={open => { if (!open) setForwardCall(null); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Chiamata ricevuta</DialogTitle></DialogHeader>
        {forwardCall && <dl className="space-y-4 text-sm">
          <div><dt className="text-muted-foreground">Chiamante</dt><dd className="break-words font-medium">{findLead(forwardCall)?.contact_name || findLead(forwardCall)?.company_name || forwardCall.destination}</dd><dd>{forwardCall.destination}</dd></div>
          <div><dt className="text-muted-foreground">Linea UK</dt><dd>{forwardCall.receivedNumber}</dd></div>
          <div><dt className="text-muted-foreground">Inoltro al numero aziendale</dt><dd className="font-medium">{forwardCall.forwardedTo}</dd></div>
          <div><dt className="text-muted-foreground">Esito</dt><dd>{forwardCall.status === 'completed' ? 'Terminata · risposta dal fisso' : forwardCall.status === 'unknown' ? 'Risposta non confermata' : STATUS_LABEL[forwardCall.status] ?? forwardCall.status}</dd></div>
          <div><dt className="text-muted-foreground">Data</dt><dd>{new Date(forwardCall.at).toLocaleString('it-IT')}</dd></div>
          {forwardCall.durationSec != null && <div><dt className="text-muted-foreground">Durata al fisso</dt><dd>{fmtDuration(forwardCall.durationSec)}</dd></div>}
        </dl>}
      </DialogContent>
    </Dialog>
  </>;
}
