import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { callLabels, voiceRequest, type VoiceCall } from '@/lib/brunoVoice';
import { actionNames, actionStates, brunoRequest, type BrunoAction } from '@/lib/brunoWorkspace';
import { BrunoLiveCall } from './BrunoLiveCall';

/** Proposal shown directly inside the Bruno chat, with its own approve/cancel buttons. */
export function BrunoInlineCard({ kind, id }: { kind: 'call' | 'action'; id: string }) {
  const [call, setCall] = useState<VoiceCall | null>(null), [action, setAction] = useState<BrunoAction | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      if (kind === 'call') setCall((await voiceRequest<{ call: VoiceCall }>({ action: 'detail', call_id: id })).call);
      else setAction((await brunoRequest<{ action: BrunoAction }>({ action: 'action_detail', id })).action);
    } catch (e) { setError((e as Error).message); }
  }, [kind, id]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (kind !== 'call' || !call || !['starting', 'dialing', 'active'].includes(call.status)) return;
    const t = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(t);
  }, [kind, call, load]);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError(null);
    try { await fn(); await load(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const status = kind === 'call' ? call?.status : action?.status;
  const expired = kind === 'call' ? !!call && new Date(call.expires_at) < new Date() : !!action && new Date(action.expires_at) < new Date();
  const pending = status === 'proposed' && !expired;
  if (!call && !action) return <div className="not-prose mt-3 rounded-lg border p-3 text-sm text-muted-foreground">{error ?? <Loader2 className="h-4 w-4 animate-spin" />}</div>;
  if (call && ['dialing', 'active'].includes(call.status)) return <div className="not-prose mt-3"><BrunoLiveCall call={call} onEnded={() => void load()} /></div>;
  return <div className="not-prose mt-3 space-y-2 rounded-lg border bg-card p-3 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="font-medium">{call ? `Chiamata ${call.call_type === 'trattativa' ? 'di trattativa' : 'di qualifica'}` : actionNames[action!.tool_name] || action!.tool_name}</span>
      <Badge variant="outline">{expired && status === 'proposed' ? 'Scaduta' : call ? callLabels[call.status] || call.status : actionStates[action!.status] || action!.status}</Badge>
    </div>
    {call && <>
      <p className="break-words">{call.leads?.contact_name || call.leads?.company_name} · {call.destination}</p>
      <p className="break-words text-muted-foreground">{call.objective}</p>
      {pending && <p className="text-xs text-muted-foreground">Bruno chiama in inglese dal numero UK presentandosi come Bruno di Vesuviano Forni.</p>}
    </>}
    {action && <p className="break-words text-muted-foreground">{action.leads?.contact_name || action.leads?.company_name || ''} {String(action.args.body || action.args.objective || action.args.message || '').slice(0, 400)}</p>}
    {error && <p role="alert" className="text-destructive break-words">{error}</p>}
    {pending && <div className="flex flex-wrap gap-2">
      <Button size="sm" disabled={busy} onClick={() => void run(() => kind === 'call' ? voiceRequest({ action: 'approve', call_id: id }) : brunoRequest({ action: 'action_approve', id }))}>
        {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : kind === 'call' ? <Phone className="mr-1 h-4 w-4" /> : <Check className="mr-1 h-4 w-4" />}{kind === 'call' ? 'Chiama ora' : 'Approva'}
      </Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => void run(() => kind === 'call' ? voiceRequest({ action: 'cancel', call_id: id }) : brunoRequest({ action: 'action_cancel', id }))}><X className="mr-1 h-4 w-4" />Annulla</Button>
    </div>}
  </div>;
}
