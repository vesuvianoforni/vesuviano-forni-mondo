import { useEffect, useState } from 'react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Phone, RefreshCw, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type Call = { id: string; lead_id: string; destination: string; objective: string; status: string; summary: string | null; created_at: string };
type State = { configured: boolean; from_number: string; language: string; calls: Call[] };
const labels: Record<string, string> = { proposed: 'Da approvare', starting: 'Avvio', dialing: 'Sta chiamando', active: 'In conversazione', completed: 'Conclusa', failed: 'Non riuscita', unknown: 'Esito da verificare', cancelled: 'Annullata' };
async function voice(body: Record<string, unknown>): Promise<State> {
  const { data, error } = await supabase.functions.invoke('bruno-voice', { body });
  if (error) {
    let message = error.message;
    if (error instanceof FunctionsHttpError) {
      const result = await error.context.json().catch(() => null);
      if (result?.error) message = `${result.error}${result.details && typeof result.details === 'string' ? `: ${result.details}` : ''}`;
    }
    throw new Error(message);
  }
  return data;
}

export function BrunoVoice() {
  const [open, setOpen] = useState(false), [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Call | null>(null);
  const { toast } = useToast();
  const refresh = async () => {
    setBusy(true); setError(null);
    try { setState(await voice({ action: 'status' })); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  useEffect(() => { if (open) void refresh(); }, [open]);
  const act = async (action: string, call?: Call) => {
    setBusy(true); setError(null); setConfirmation(null);
    try {
      await voice({ action, ...(call ? { call_id: call.id } : {}) });
      toast({ title: action === 'approve' ? 'Richiesta di chiamata inoltrata' : action === 'cancel' ? 'Proposta annullata' : 'Assistente aggiornato' });
      await refresh();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  return <>
    <Button variant="outline" size="sm" onClick={() => setOpen(true)}><Phone className="mr-2 h-4 w-4" />Chiamate</Button>
    <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) setConfirmation(null); }}>
      <DialogContent className="max-w-2xl max-h-[85dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>Chiamate di Bruno</DialogTitle><DialogDescription>{state?.from_number || '+44 7457 416033'} · Inglese · Qualificazione cliente</DialogDescription></DialogHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline">{state?.configured ? 'Assistente configurato' : 'Configurazione da verificare'}</Badge>
          <Button variant="ghost" size="icon" disabled={busy} onClick={() => void refresh()} aria-label="Aggiorna chiamate">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}</Button>
        </div>
        {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
        {confirmation && <div className="border-y py-4 space-y-3">
          <p className="font-medium">Chiamare ora {confirmation.destination}?</p>
          <p className="text-sm break-words">{confirmation.objective}</p>
          <div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => void act('approve', confirmation)}><Phone className="mr-2 h-4 w-4" />Conferma chiamata</Button><Button variant="outline" onClick={() => setConfirmation(null)}>Indietro</Button></div>
        </div>}
        {!busy && state?.calls.length === 0 && <p className="py-6 text-sm text-muted-foreground">Nessuna chiamata proposta.</p>}
        <div className="divide-y">
          {state?.calls.map(call => <div key={call.id} className="py-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2"><a className="text-sm font-medium text-primary underline" href={`/erp/crm?lead=${call.lead_id}`}>{call.destination}</a><Badge variant="outline">{labels[call.status] || call.status}</Badge></div>
            <p className="text-sm break-words">{call.objective}</p>
            <p className="text-xs text-muted-foreground">{new Date(call.created_at).toLocaleString('it-IT')}</p>
            {call.summary && <p className="text-sm whitespace-pre-wrap break-words">{call.summary}</p>}
            {call.status === 'proposed' && <div className="flex flex-wrap gap-2"><Button size="sm" disabled={busy} onClick={() => setConfirmation(call)}><Check className="mr-1 h-4 w-4" />Approva</Button><Button size="sm" variant="outline" disabled={busy} onClick={() => void act('cancel', call)}><X className="mr-1 h-4 w-4" />Annulla</Button></div>}
          </div>)}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}