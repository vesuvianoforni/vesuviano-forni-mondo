import { useEffect, useRef, useState } from 'react';
import { PhoneOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { callLabels, voiceRequest, type VoiceCall } from '@/lib/brunoVoice';

type Line = { speaker: 'customer' | 'bruno'; text: string; at: string | null };
type Live = { status: string; live: boolean; transcript: Line[] };

export function BrunoLiveCall({ call, onEnded }: { call: VoiceCall; onEnded: () => void }) {
  const [live, setLive] = useState<Live | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const box = useRef<HTMLDivElement>(null), ended = useRef(onEnded); ended.current = onEnded;
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const r = await voiceRequest<Live>({ action: 'live', call_id: call.id });
        if (!alive) return; setLive(r);
        if (!r.live) ended.current();
      } catch (e) { if (alive) setError((e as Error).message); }
    };
    void poll();
    const t = window.setInterval(() => { if (!document.hidden) void poll(); }, 2500);
    return () => { alive = false; window.clearInterval(t); };
  }, [call.id]);
  useEffect(() => {
    const start = new Date(call.started_at || call.created_at).getTime();
    const t = window.setInterval(() => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000))), 1000);
    return () => window.clearInterval(t);
  }, [call.started_at, call.created_at]);
  useEffect(() => { const el = box.current; if (el) el.scrollTop = el.scrollHeight; }, [live?.transcript.length]);
  const hangup = async () => {
    setBusy(true); setError(null);
    try { await voiceRequest({ action: 'hangup', call_id: call.id }); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const status = live?.status ?? call.status;
  return <div className="rounded-lg border bg-muted/40 p-4 space-y-3 min-w-0">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Chiamata in corso</p>
        <p className="text-lg font-semibold break-words">{call.leads?.contact_name || call.leads?.company_name || call.destination}</p>
        <p className="text-sm text-muted-foreground">{call.destination} · {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1"><span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />{callLabels[status] || status}</Badge>
        <Button variant="destructive" disabled={busy} onClick={() => void hangup()} aria-label="Chiudi chiamata">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PhoneOff className="mr-2 h-4 w-4" />}Chiudi chiamata
        </Button>
      </div>
    </div>
    {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
    <div ref={box} className="max-h-80 overflow-y-auto space-y-2 rounded-md bg-background p-3">
      {!live?.transcript.length && <p className="text-sm text-muted-foreground">{status === 'active' ? 'In ascolto… la trascrizione compare qui in tempo reale.' : 'Sto chiamando il cliente…'}</p>}
      {live?.transcript.map((l, i) => <div key={i} className={l.speaker === 'bruno' ? 'flex justify-end' : 'flex'}>
        <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm break-words ${l.speaker === 'bruno' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <p className="text-[11px] opacity-70">{l.speaker === 'bruno' ? 'Bruno' : 'Cliente'}</p>{l.text}
        </div>
      </div>)}
    </div>
  </div>;
}
