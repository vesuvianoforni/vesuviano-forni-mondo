import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { callLabels, voiceRequest, type VoiceCall } from '@/lib/brunoVoice';

type Detail = VoiceCall & { recording_url: string | null; transcript: { speaker: string; text: string; at: string | null }[] };
export function BrunoCallDetail({ callId, onClose }: { callId: string | null; onClose: () => void }) {
  const [data,setData] = useState<Detail | null>(null), [error,setError] = useState<string | null>(null), [loading,setLoading] = useState(false), [revision,setRevision] = useState(0);
  useEffect(() => {
    let active = true; setData(null); setError(null);
    if (!callId) return;
    setLoading(true);
    voiceRequest<{ call: Detail }>({action:'detail',call_id:callId}).then(r => { if (active) setData(r.call); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  },[callId,revision]);
  return <Dialog open={Boolean(callId)} onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="max-w-3xl max-h-[90dvh] overflow-y-auto [overflow-wrap:anywhere]">
    <DialogHeader><DialogTitle>Conversazione telefonica</DialogTitle><DialogDescription>{data?.leads?.contact_name || data?.leads?.company_name || data?.destination || 'Bruno AI'} · Inglese</DialogDescription></DialogHeader>
    <div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">{data ? callLabels[data.status] || data.status : 'Caricamento'}</Badge><Button variant="ghost" size="icon" aria-label="Aggiorna conversazione" disabled={loading} onClick={() => setRevision(n=>n+1)}><RefreshCw className="h-4 w-4" /></Button></div>
    {loading && <Loader2 className="h-5 w-5 animate-spin" />}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {data && <><p className="text-sm">{data.objective}</p><div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><span>{new Date(data.started_at || data.created_at).toLocaleString('it-IT')}</span>{data.duration_seconds != null && <span>{Math.floor(data.duration_seconds/60)} min {data.duration_seconds%60} sec</span>}<a className="flex items-center gap-1 text-primary underline" href={`/erp/crm?lead=${data.lead_id}`}><ExternalLink className="h-3 w-3" />Scheda cliente</a></div>
    {data.recording_url ? <audio controls preload="none" src={data.recording_url} className="w-full" aria-label="Registrazione chiamata Bruno" /> : <p className="text-sm text-muted-foreground">{data.recording_status === 'unavailable' ? 'Registrazione non disponibile.' : 'Registrazione in elaborazione.'}</p>}
    <Tabs defaultValue="summary"><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="summary">Riepilogo</TabsTrigger><TabsTrigger value="transcript">Trascrizione</TabsTrigger></TabsList>
    <TabsContent value="summary"><p className="whitespace-pre-wrap text-sm leading-relaxed">{data.summary || (data.summary_status === 'unavailable' ? 'Riepilogo non disponibile.' : 'Riepilogo in elaborazione.')}</p>{data.summary && data.summary_status !== 'ready' && <p className="mt-2 text-xs text-muted-foreground">Riepilogo provvisorio di qualificazione</p>}</TabsContent>
    <TabsContent value="transcript"><div className="max-h-[45dvh] space-y-4 overflow-y-auto overscroll-contain">{data.transcript?.length ? data.transcript.map((m,i) => <div key={i} className="border-l-2 border-border pl-3"><p className="mb-1 text-xs font-semibold text-muted-foreground">{m.speaker === 'bruno' ? 'Bruno' : 'Cliente'}</p><p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p></div>) : <p className="text-sm text-muted-foreground">{data.transcript_status === 'unavailable' ? 'Trascrizione non disponibile.' : 'Trascrizione in elaborazione.'}</p>}</div></TabsContent></Tabs></>}
  </DialogContent></Dialog>;
}