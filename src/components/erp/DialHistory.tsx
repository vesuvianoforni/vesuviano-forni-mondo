import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Bot, Loader2, PhoneCall, UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BrunoCallDetail } from '@/components/erp/BrunoCallDetail';
import type { CRMLead } from '@/components/erp/CRMLeadCard';

type CallRow = {
  id: string;
  kind: 'direct' | 'ai';
  leadId: string;
  destination: string;
  direction: 'outbound' | 'inbound';
  status: string;
  at: string;
  durationSec: number | null;
  summary: string | null;
  objective: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  completed: 'Completata', ended: 'Terminata', failed: 'Non riuscita', unknown: 'Esito incerto',
  cancelled: 'Annullata', proposed: 'Proposta', starting: 'In avvio', dialing: 'In composizione',
  active: 'In corso', preparing: 'In preparazione',
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [direct, voice] = await Promise.all([
        supabase.from('crm_direct_calls')
          .select('id,lead_id,destination,status,created_at,answered_at,ended_at')
          .order('created_at', { ascending: false }).limit(200),
        supabase.from('bruno_voice_calls')
          .select('id,lead_id,destination,direction,status,objective,summary,created_at,started_at,ended_at')
          .order('created_at', { ascending: false }).limit(200),
      ]);
      if (cancelled) return;
      const err = direct.error ?? voice.error;
      if (err) { setError(err.message); setLoading(false); return; }
      const rows: CallRow[] = [
        ...(direct.data ?? []).map(c => ({
          id: `d-${c.id}`, kind: 'direct' as const, leadId: c.lead_id, destination: c.destination,
          direction: 'outbound' as const, status: c.status, at: c.created_at,
          durationSec: c.answered_at && c.ended_at
            ? (new Date(c.ended_at).getTime() - new Date(c.answered_at).getTime()) / 1000 : null,
          summary: null, objective: null,
        })),
        ...(voice.data ?? []).map(c => ({
          id: `v-${c.id}`, kind: 'ai' as const, leadId: c.lead_id, destination: c.destination,
          direction: (c.direction === 'inbound' ? 'inbound' : 'outbound') as 'outbound' | 'inbound',
          status: c.status, at: c.created_at,
          durationSec: c.started_at && c.ended_at
            ? (new Date(c.ended_at).getTime() - new Date(c.started_at).getTime()) / 1000 : null,
          summary: c.summary ?? null, objective: c.objective ?? null,
        })),
      ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 200);
      setCalls(rows); setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const leadById = useMemo(() => new Map(leads.map(l => [l.id, l])), [leads]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (error) return <p className="text-sm text-destructive">Impossibile caricare lo storico: {error}</p>;
  if (calls.length === 0) return <p className="py-10 text-center text-sm text-muted-foreground">Nessuna chiamata registrata.</p>;

  return <>
    <ul className="divide-y rounded-lg border">
    {calls.map(c => {
      const lead = leadById.get(c.leadId);
      const name = lead?.contact_name || lead?.company_name || c.destination;
      const dur = fmtDuration(c.durationSec);
      const DirIcon = c.direction === 'inbound' ? ArrowDownLeft : ArrowUpRight;
      const open = () => { if (c.kind === 'ai') setAiCallId(c.id.slice(2)); else setDirectCall(c); };
      return <li key={c.id}>
        <div role="button" tabIndex={0} onClick={open} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
          className="flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Apri dettaglio chiamata con ${name}`}>
        <div className="mt-1 shrink-0 rounded-full bg-muted p-2">
          {c.kind === 'ai' ? <Bot className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name}</p>
          <p className="truncate text-sm text-muted-foreground">
            <DirIcon className="mr-1 inline h-3.5 w-3.5" />
            {c.destination} · {new Date(c.at).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            {dur ? ` · ${dur}` : ''}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="outline">{c.kind === 'ai' ? 'Bruno AI' : 'Diretta'}</Badge>
            <Badge variant={c.status === 'failed' ? 'destructive' : 'secondary'}>{STATUS_LABEL[c.status] ?? c.status}</Badge>
            {c.objective && <Badge variant="outline">{c.objective}</Badge>}
          </div>
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
    <Dialog open={Boolean(directCall)} onOpenChange={open => { if (!open) setDirectCall(null); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chiamata diretta</DialogTitle>
          <DialogDescription>
            {directCall ? `${leadById.get(directCall.leadId)?.contact_name || leadById.get(directCall.leadId)?.company_name || directCall.destination} · ${directCall.destination}` : ''}
          </DialogDescription>
        </DialogHeader>
        {directCall && <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline">Diretta</Badge>
            <Badge variant={directCall.status === 'failed' ? 'destructive' : 'secondary'}>{STATUS_LABEL[directCall.status] ?? directCall.status}</Badge>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{new Date(directCall.at).toLocaleString('it-IT')}</span>
            {fmtDuration(directCall.durationSec) && <span>{fmtDuration(directCall.durationSec)}</span>}
          </div>
          <p className="text-muted-foreground">Le chiamate fatte direttamente dal dialer non hanno trascrizione né riepilogo: la conversazione avviene tra te e il cliente, senza Bruno.</p>
        </div>}
      </DialogContent>
    </Dialog>
  </>;
}
