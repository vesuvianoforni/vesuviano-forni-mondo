import { useCallback, useEffect, useRef, useState } from 'react';
import { Phone, RefreshCw, Check, X, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrunoCallDetail } from './BrunoCallDetail';
import { BrunoLiveCall } from './BrunoLiveCall';
import { callLabels, voiceRequest, type VoiceCall, type VoiceView } from '@/lib/brunoVoice';

type State = { configured: boolean; from_number: string; language: string; calls: VoiceCall[]; has_more: boolean };

const outcomeLabels: Record<string,string> = { no_answer: 'Nessuna risposta', busy: 'Occupato', unreachable: 'Non raggiungibile', no_conversation: 'Riagganciata subito' };
export function BrunoVoice({embedded=false}: {embedded?:boolean | undefined}) {
  const [open, setOpen] = useState(embedded), [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<VoiceCall | null>(null);
  const [view,setView] = useState<VoiceView>('planned'), [detail,setDetail] = useState<string | null>(null);
  const generation = useRef(0);
  const { toast } = useToast();
  const refresh = useCallback(async (append = false, silent = false) => {
    if (silent && (state?.calls.length ?? 0) > 30) return;
    const version = ++generation.current;
    if (!silent) setBusy(true); setError(null);
    const last = append ? state?.calls.at(-1) : null;
    try {
      const result = await voiceRequest<State>({ action: 'status', view, ...(last ? {before_at:last.created_at,before_id:last.id} : {}) });
      if (version === generation.current) setState(previous => ({...result,calls:append ? [...(previous?.calls ?? []),...result.calls.filter(c=>!previous?.calls.some(p=>p.id===c.id))] : result.calls}));
    } catch (e) { if (version === generation.current) setError((e as Error).message); } finally { if (version === generation.current) setBusy(false); }
  },[view,state?.calls]);
  const refreshRef = useRef(refresh); refreshRef.current = refresh;
  useEffect(() => {
    generation.current++; setConfirmation(null); setState(null);
    if (!open) return;
    void refreshRef.current();
    const timer = window.setInterval(() => { if (!document.hidden) void refreshRef.current(false,true); },5000);
    return () => { window.clearInterval(timer); generation.current++; };
  },[open,view]);
  const act = async (action: string, call?: VoiceCall) => {
    const version=++generation.current;
    setBusy(true); setError(null); setConfirmation(null);
    try {
      await voiceRequest({ action, ...(call ? { call_id: call.id } : {}) });
      if(version!==generation.current)return;
      toast({ title: action === 'approve' ? 'Richiesta di chiamata inoltrata' : action === 'cancel' ? 'Proposta annullata' : 'Assistente aggiornato' });
      await refreshRef.current();
    } catch (e) { if(version===generation.current)setError((e as Error).message); } finally { if(version===generation.current)setBusy(false); }
  };
  const content=<>
    <h2 className="text-xl font-semibold">Chiamate di Bruno</h2>
    <p className="text-sm text-muted-foreground">{state?.from_number || '+44 7457 416033'} · Inglese · Qualifica / Trattativa</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline">{state?.configured ? 'Assistente configurato' : 'Configurazione da verificare'}</Badge>
          <Button variant="outline" size="sm" className="ml-auto" disabled={busy} onClick={() => void act('configure')}>Aggiorna voce</Button>
          <Button variant="ghost" size="icon" disabled={busy} onClick={() => void refresh()} aria-label="Aggiorna chiamate">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}</Button>
        </div>
        <Tabs value={view} onValueChange={v=>setView(v as VoiceView)}><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="planned">In programma</TabsTrigger><TabsTrigger value="executed">Eseguite / Esiti</TabsTrigger></TabsList></Tabs>
        {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
        {confirmation && <div className="border-y py-4 space-y-3">
          <p className="font-medium">Chiamare ora {confirmation.destination}?</p>
          <Badge variant="outline">{confirmation.call_type === 'trattativa' ? 'Trattativa' : 'Qualifica'}</Badge>
          <p className="text-sm break-words">{confirmation.objective}</p>
          {confirmation.instructions && <p className="text-sm text-muted-foreground break-words">Istruzioni: {confirmation.instructions}</p>}
          <p className="text-sm text-muted-foreground">La chiamata sarà registrata e trascritta; Bruno si presenta come Bruno di Vesuviano Forni e avvisa della registrazione all'inizio della conversazione.</p>
          <div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => void act('approve', confirmation)}><Phone className="mr-2 h-4 w-4" />Conferma chiamata</Button><Button variant="outline" onClick={() => setConfirmation(null)}>Indietro</Button></div>
        </div>}
        {state?.calls.filter(c => ['dialing','active'].includes(c.status)).map(c => <BrunoLiveCall key={c.id} call={c} onEnded={() => void refreshRef.current(false,true)} />)}
        {!busy && state?.calls.length === 0 && <p className="py-6 text-sm text-muted-foreground">{view === 'planned' ? 'Nessuna chiamata in programma.' : 'Nessuna chiamata eseguita.'}</p>}
        <div className="divide-y">
          {state?.calls.map(call => <div key={call.id} className="py-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2"><a className="text-sm font-medium text-primary underline break-words" href={`/erp/crm?lead=${call.lead_id}`}>{call.leads?.contact_name || call.leads?.company_name || call.destination}</a><span className="flex flex-wrap items-center gap-1">{call.direction === 'inbound' && <Badge>In entrata</Badge>}<Badge variant="outline">{call.direction === 'inbound' ? 'Risposta' : call.call_type === 'trattativa' ? 'Trattativa' : 'Qualifica'}</Badge><Badge variant="outline">{call.status === 'proposed' && new Date(call.expires_at) < new Date() ? 'Proposta scaduta' : (call.error_code && outcomeLabels[call.error_code]) || callLabels[call.status] || call.status}</Badge></span></div>
            <p className="text-xs text-muted-foreground">{call.destination}</p>
            <p className="text-sm break-words">{call.objective}</p>
            <p className="text-xs text-muted-foreground">{call.started_at ? 'Chiamata' : 'Proposta'} · {new Date(call.started_at || call.created_at).toLocaleString('it-IT')}{call.duration_seconds != null && ` · ${Math.floor(call.duration_seconds/60)} min ${call.duration_seconds%60} sec`}</p>
            {call.summary && <p className="text-sm whitespace-pre-wrap break-words line-clamp-3">{call.summary}</p>}
            {call.started_at && <Button variant="outline" size="sm" onClick={()=>setDetail(call.id)}><FileText className="mr-2 h-4 w-4" />Audio e conversazione</Button>}
            {call.error_code && <p className="text-xs text-destructive">{outcomeLabels[call.error_code] ? 'Nessuna conversazione con il cliente: puoi riproporre la chiamata più tardi.' : 'Esito da verificare prima di una nuova chiamata.'}</p>}
            {call.status === 'proposed' && <div className="flex flex-wrap gap-2"><Button size="sm" disabled={busy || new Date(call.expires_at) < new Date()} onClick={() => setConfirmation(call)}><Check className="mr-1 h-4 w-4" />Approva</Button><Button size="sm" variant="outline" disabled={busy} onClick={() => void act('cancel', call)}><X className="mr-1 h-4 w-4" />Annulla</Button></div>}
          </div>)}
        </div>
        {state?.has_more && <Button variant="outline" disabled={busy} onClick={()=>void refresh(true)}>Carica precedenti</Button>}
  </>;
  return <>
    {embedded ? <div className="space-y-4 p-4 md:p-6">{content}</div>:<><Button variant="outline" size="sm" onClick={()=>setOpen(true)}><Phone className="mr-2 h-4 w-4"/>Chiamate</Button><Dialog open={open} onOpenChange={value=>{setOpen(value);if(!value)setConfirmation(null)}}><DialogContent className="max-w-4xl max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Chiamate di Bruno</DialogTitle><DialogDescription>Numero UK · Inglese</DialogDescription></DialogHeader>{content}</DialogContent></Dialog></>}
    <BrunoCallDetail callId={detail} onClose={()=>setDetail(null)} />
  </>;
}