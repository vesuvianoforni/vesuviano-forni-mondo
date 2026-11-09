import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useServerFn } from '@tanstack/react-start';
import type { Call, TelnyxRTC } from '@telnyx/webrtc';
import { Bot, Headset, Loader2, Mic, MicOff, Phone, PhoneOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { prepareDirectCall, updateDirectCall, pendingDirectCalls } from '@/lib/crmDialer.functions';
import { CRM_CALLER_NUMBER, canStartCRMCall, directStatusLabels, type CallMode } from '@/lib/crmDialer';
import { voiceRequest } from '@/lib/brunoVoice';
import type { CRMLead } from './CRMLeadCard';

const CallContext = createContext<{ openCall: (lead: CRMLead) => void; occupied: boolean } | null>(null);
export function CRMCallButton({ lead, compact = false, showNumber = false }: { lead: CRMLead; compact?: boolean; showNumber?: boolean }) {
  const context = useContext(CallContext);
  if (!lead.phone) return null;
  const name = lead.company_name || lead.contact_name || lead.phone;
  return <Tooltip><TooltipTrigger asChild>
    <Button variant={showNumber ? 'link' : 'outline'} size={compact ? 'icon' : 'sm'}
      className={compact ? 'h-7 w-7 shrink-0' : showNumber ? 'h-auto max-w-full justify-start p-0 text-xs' : 'gap-2'}
      aria-label={`Chiama ${name}`} disabled={!context || context.occupied}
      onClick={event => { event.stopPropagation(); context?.openCall(lead); }}>
      <Phone className={compact ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5 shrink-0'} />
      {!compact && <span className="min-w-0 truncate">{showNumber ? lead.phone : 'Chiama'}</span>}
    </Button>
  </TooltipTrigger><TooltipContent>Chiama con Bruno AI o direttamente</TooltipContent></Tooltip>;
}

type Direct = { id: string; name: string; destination: string; status: string; answered: number | null };
export function CRMCallProvider({ children }: { children: ReactNode }) {
  const prepare = useServerFn(prepareDirectCall), update = useServerFn(updateDirectCall), pending = useServerFn(pendingDirectCalls);
  const [lead, setLead] = useState<CRMLead | null>(null), [mode, setMode] = useState<CallMode>(null);
  const [callType, setCallType] = useState<'qualifica' | 'trattativa'>('qualifica'), [instructions, setInstructions] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const [direct, setDirect] = useState<Direct | null>(null), [muted, setMuted] = useState(false), [elapsed, setElapsed] = useState(0);
  const [aiProposal, setAiProposal] = useState<{ id: string; destination: string } | null>(null);
  const [unresolved, setUnresolved] = useState<{ id: string; destination: string } | null>(null);
  const clientRef = useRef<TelnyxRTC | null>(null), callRef = useRef<Call | null>(null), streamRef = useRef<MediaStream | null>(null);
  const directRef = useRef<Direct | null>(null), audioRef = useRef<HTMLAudioElement | null>(null), version = useRef(0);
  const terminalRef = useRef(false), endingRef = useRef(false), writes = useRef(Promise.resolve());
  const notify = (event: 'dialing' | 'active' | 'ended' | 'failed' | 'unknown', providerId?: string) => {
    const call = directRef.current;
    if (!call) return;
    writes.current = writes.current.then(async () => {
      await update({ data: { id: call.id, event, ...(providerId ? { provider_id: providerId } : {}) } });
    }).catch(() => { setError('Stato nello storico non aggiornato: verifica prima di richiamare.'); });
  };
  const dispose = () => {
    streamRef.current?.getTracks().forEach(track => track.stop()); streamRef.current = null;
    const client = clientRef.current; clientRef.current = null; callRef.current = null;
    if (client) { client.off('telnyx.notification'); client.off('telnyx.error'); client.off('telnyx.socket.close'); void client.disconnect(); }
  };
  const finish = (status: 'ended' | 'failed' | 'unknown') => {
    if (terminalRef.current) return;
    terminalRef.current = true;
    notify(status, callRef.current?.id);
    setDirect(previous => previous ? { ...previous, status } : null);
    dispose(); setBusy(false); setMuted(false);
  };
  useEffect(() => () => {
    version.current++;
    void callRef.current?.hangup();
    streamRef.current?.getTracks().forEach(track => track.stop());
    void clientRef.current?.disconnect();
  }, []);
  useEffect(() => {
    if (!direct?.answered || direct.status !== 'active') return;
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - (direct.answered ?? Date.now())) / 1000)));
    tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer);
  }, [direct?.answered, direct?.status]);

  const openCall = (customer: CRMLead) => {
    setLead(customer); setMode(null); setInstructions(''); setCallType('qualifica'); setError(null); setAiProposal(null); setUnresolved(null);
  };
  const startDirect = async () => {
    if (!lead) return;
    const current = ++version.current;
    directRef.current = null; setDirect(null); setElapsed(0);
    setBusy(true); setError(null); terminalRef.current = false; endingRef.current = false;
    try {
      const previous = await pending();
      if (previous[0]) { setUnresolved(previous[0]); throw new Error('Una precedente chiamata risulta ancora aperta. Verifica l’esito prima di chiamare.'); }
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microfono non disponibile: apri il CRM in una scheda del browser.');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
      if (version.current !== current) { stream.getTracks().forEach(track => track.stop()); return; }
      streamRef.current = stream;
      const sdk = await import('@telnyx/webrtc');
      const session = await prepare({ data: { lead_id: lead.id } });
      const value = { id: session.id, name: lead.company_name || lead.contact_name || 'Cliente', destination: session.destination, status: 'preparing', answered: null };
      directRef.current = value; setDirect(value);
      const client = new sdk.TelnyxRTC({ login_token: session.token, debug: false, enableCallReports: false, hangupOnBeforeUnload: true });
      clientRef.current = client;
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error('Il telefono non si è collegato. Nessuna chiamata avviata.')), 30000);
        client.on('telnyx.ready', () => { window.clearTimeout(timer); resolve(); });
        client.on('telnyx.error', () => { window.clearTimeout(timer); reject(new Error('Collegamento telefonico non riuscito.')); });
        // Telnyx requires propagation time for a freshly created per-call credential.
        window.setTimeout(() => { if (version.current === current) void client.connect().catch(reject); }, 5000);
      });
      if (version.current !== current || terminalRef.current) return;
      client.off('telnyx.error');
      client.on('telnyx.error', () => { setError('Errore del telefono: l’esito va verificato prima di richiamare.'); finish('unknown'); });
      client.on('telnyx.socket.close', () => { if (!terminalRef.current) { setError('Collegamento interrotto: non verrà avviata un’altra chiamata.'); finish('unknown'); } });
      client.on('telnyx.notification', event => {
        const call = event.call;
        if (!call || call.id !== callRef.current?.id || event.type !== 'callUpdate') return;
        if (call.state === 'active') {
          if (directRef.current?.answered) return;
          const answered = Date.now();
          if (directRef.current) directRef.current = { ...directRef.current, status: 'active', answered };
          setDirect(previous => previous ? { ...previous, status: 'active', answered } : null); notify('active', call.id);
          void audioRef.current?.play().catch(() => setError('Audio bloccato dal browser: premi Attiva audio.'));
        } else if (call.state === 'hangup' || call.state === 'destroy') finish(directRef.current?.answered || endingRef.current ? 'ended' : 'failed');
      });
      callRef.current = client.newCall({ destinationNumber: session.destination, callerNumber: session.from_number, callerName: 'Vesuviano Forni',
        localStream: stream, ...(audioRef.current ? { remoteElement: audioRef.current } : {}), audio: true, video: false });
      if (directRef.current) directRef.current = { ...directRef.current, status: 'dialing' };
      setDirect(previous => previous ? { ...previous, status: 'dialing' } : null); notify('dialing', callRef.current.id);
      setLead(null); setBusy(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Chiamata non avviata.';
      if (directRef.current && !terminalRef.current) finish(callRef.current ? 'unknown' : 'failed');
      else dispose();
      setError(message); setBusy(false);
    }
  };
  const end = async () => {
    setBusy(true); endingRef.current = true;
    try { await callRef.current?.hangup(); finish('ended'); }
    catch { finish('unknown'); setError('Chiusura non confermata: verifica l’esito prima di richiamare.'); }
  };
  const startAI = async () => {
    if (!lead) return;
    setBusy(true); setError(null);
    try {
      if (!aiProposal) {
        const result = await voiceRequest<{ proposal: { id: string; destination: string } }>({ action: 'propose', lead_id: lead.id, call_type: callType,
          objective: callType === 'qualifica' ? 'Qualificare il progetto forno del cliente e rispondere con la knowledge base Vesuviano.' : 'Confrontarsi sull’offerta già inviata, raccogliere obiezioni e concordare il prossimo passo.', instructions: instructions.trim() });
        setAiProposal(result.proposal);
      } else {
        await voiceRequest({ action: 'approve', call_id: aiProposal.id });
        setLead(null); setAiProposal(null);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Chiamata AI non avviata.'); }
    finally { setBusy(false); }
  };
  const dismiss = async () => {
    if (busy) return;
    if (aiProposal) {
      setBusy(true);
      try { await voiceRequest({ action: 'cancel', call_id: aiProposal.id }); }
      catch { setError('Proposta non annullata: riprova prima di chiudere.'); setBusy(false); return; }
      setBusy(false);
    }
    setLead(null); setMode(null); setAiProposal(null);
  };
  const live = direct && ['preparing', 'dialing', 'active'].includes(direct.status);
  return <CallContext.Provider value={{ openCall, occupied: Boolean(live || busy) }}>
    {children}
    <audio ref={audioRef} autoPlay aria-label="Audio chiamata diretta" />
    <Dialog open={Boolean(lead)} onOpenChange={open => { if (!open) void dismiss(); }}>
      <DialogContent className="erp-dashboard max-h-[90dvh] w-[calc(100%-24px)] max-w-lg overflow-y-auto" onInteractOutside={e => { if (busy) e.preventDefault(); }} onEscapeKeyDown={e => { if (busy) e.preventDefault(); }}>
        <DialogHeader><DialogTitle>Chiama {lead?.company_name || lead?.contact_name || 'cliente'}</DialogTitle><DialogDescription>{lead?.phone} · Da {CRM_CALLER_NUMBER}</DialogDescription></DialogHeader>
        <ToggleGroup type="single" value={mode ?? ''} disabled={busy || Boolean(aiProposal)} onValueChange={value => setMode(value === 'ai' || value === 'direct' ? value : null)} className="grid grid-cols-2 gap-2" aria-label="Chi effettua la chiamata">
          <ToggleGroupItem value="ai" className="h-20 flex-col gap-2 border data-[state=on]:bg-muted data-[state=on]:text-foreground data-[state=on]:border-primary" aria-label="Bruno AI"><Bot className="h-5 w-5" />Bruno AI</ToggleGroupItem>
          <ToggleGroupItem value="direct" className="h-20 flex-col gap-2 border data-[state=on]:bg-muted data-[state=on]:text-foreground data-[state=on]:border-primary" aria-label="Chiamata diretta"><Headset className="h-5 w-5" />Chiamata diretta</ToggleGroupItem>
        </ToggleGroup>
        {mode === 'ai' && <div className="space-y-3">
          <ToggleGroup type="single" value={callType} disabled={busy || Boolean(aiProposal)} onValueChange={value => { if (value === 'qualifica' || value === 'trattativa') setCallType(value); }} aria-label="Scopo chiamata AI">
            <ToggleGroupItem value="qualifica">Qualifica</ToggleGroupItem><ToggleGroupItem value="trattativa">Trattativa</ToggleGroupItem>
          </ToggleGroup>
          <Label htmlFor="call-instructions">Indicazioni per Bruno</Label>
          <Textarea id="call-instructions" placeholder="Indicazioni per questa chiamata…" rows={3} maxLength={2000} value={instructions} disabled={busy || Boolean(aiProposal)} onChange={e => setInstructions(e.target.value)} />
          {aiProposal && <p className="text-sm font-medium">Proposta pronta · Chiamare ora {aiProposal.destination} con Bruno?</p>}
        </div>}
        {mode === 'direct' && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Headset className="h-4 w-4 shrink-0" />Microfono e audio del browser · Operatore</p>}
        {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
        {unresolved && <Button variant="outline" disabled={busy} onClick={async () => {
          setBusy(true);
          try { await update({ data: { id: unresolved.id, event: 'unknown' } }); setUnresolved(null); setError('Esito segnato da verificare, nessuna chiamata ripetuta.'); }
          catch (e) { setError(e instanceof Error ? e.message : 'Impossibile aggiornare lo stato.'); }
          finally { setBusy(false); }
        }}>Segna la precedente come esito da verificare</Button>}
        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button variant="outline" disabled={busy} onClick={() => void dismiss()}>Annulla</Button>
          <Button disabled={!canStartCRMCall(mode, true, busy) || Boolean(unresolved)} onClick={() => { if (mode === 'direct') void startDirect(); else void startAI(); }}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
            {busy ? 'Preparazione…' : mode === 'ai' && !aiProposal ? 'Prepara proposta' : 'Chiama ora'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    {direct && <aside className="erp-dashboard fixed bottom-4 right-4 z-[60] w-[calc(100%-32px)] max-w-sm rounded-lg border bg-background p-4 text-foreground shadow-lg" aria-label="Chiamata CRM">
      {direct && <div className="space-y-3">
        <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate font-semibold">{direct.name}</p><p className="text-xs text-muted-foreground">{direct.destination} · Chiamata diretta UK</p></div>
          {!live && <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Chiudi pannello chiamata" onClick={() => { setDirect(null); directRef.current = null; setError(null); }}><X className="h-4 w-4" /></Button>}
        </div>
        <p role="status" className="text-sm">{directStatusLabels[direct.status]}{direct.status === 'active' && ` · ${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`}</p>
        {error && <p role="alert" className="break-words text-xs text-destructive">{error}</p>}
        {live && <div className="flex items-center gap-2">
          <Tooltip><TooltipTrigger asChild><Button size="icon" variant="outline" disabled={direct.status !== 'active'} aria-label={muted ? 'Riattiva microfono' : 'Disattiva microfono'} onClick={() => { if (muted) callRef.current?.unmuteAudio(); else callRef.current?.muteAudio(); setMuted(!muted); }}>{muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</Button></TooltipTrigger><TooltipContent>{muted ? 'Riattiva microfono' : 'Disattiva microfono'}</TooltipContent></Tooltip>
          <Button variant="outline" size="sm" onClick={() => { void audioRef.current?.play().then(() => setError(null)).catch(() => setError('Audio non disponibile.')); }}>Attiva audio</Button>
          <Button variant="destructive" size="sm" className="ml-auto" disabled={busy || direct.status === 'preparing'} onClick={() => void end()}><PhoneOff className="mr-1 h-4 w-4" />Chiudi</Button>
        </div>}
      </div>}
    </aside>}
  </CallContext.Provider>;
}