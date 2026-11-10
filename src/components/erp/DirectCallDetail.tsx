import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getDirectCallResult } from '@/lib/crmDialer.functions';

type Result = Awaited<ReturnType<typeof getDirectCallResult>>;
export function DirectCallDetail({ callId, onClose }: { callId: string | null; onClose: () => void }) {
  const getResult = useServerFn(getDirectCallResult);
  const [result, setResult] = useState<Result | null>(null), [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0), [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!callId) return;
    let cancelled = false; setResult(null); setError(null); setLoading(true);
    getResult({ data: { id: callId } }).then(data => { if (!cancelled) setResult(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Dettaglio non disponibile.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [callId, refresh, getResult]);
  return <Dialog open={Boolean(callId)} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
      <DialogHeader><DialogTitle>Chiamata operatore</DialogTitle><DialogDescription>Riepilogo e conversazione registrata</DialogDescription></DialogHeader>
      {loading && <Loader2 className="h-5 w-5 animate-spin" aria-label="Caricamento chiamata" />}
      {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
      {result && <div className="min-w-0 space-y-5">
        {result.audioUrl && <audio controls preload="none" src={result.audioUrl} className="w-full" aria-label="Registrazione chiamata operatore" />}
        {(result.audioParts ?? []).map(part => <div key={part.ordinal}><p className="mb-1 text-xs text-muted-foreground">Registrazione · Parte {part.ordinal + 1}</p><audio controls preload="none" src={part.url} className="w-full" aria-label={`Registrazione chiamata, parte ${part.ordinal + 1}`} /></div>)}
        <section><h3 className="mb-2 font-semibold">Riepilogo</h3><p className="whitespace-pre-wrap break-words text-sm">{result.summary || (['pending','starting','recording','processing','queued','running'].includes(result.processing_status) ? 'Riepilogo in preparazione…' : 'Riepilogo non disponibile per questa chiamata.')}</p></section>
        {result.transcript && <section><h3 className="mb-2 font-semibold">Trascrizione</h3><p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{result.transcript}</p></section>}
        {result.error && <p role="status" className="break-words text-sm text-destructive">{result.error}</p>}
      </div>}
      <div className="flex justify-end"><Button variant="outline" disabled={loading} onClick={() => setRefresh(n => n + 1)}><RefreshCw className="mr-2 h-4 w-4" />Aggiorna</Button></div>
    </DialogContent>
  </Dialog>;
}