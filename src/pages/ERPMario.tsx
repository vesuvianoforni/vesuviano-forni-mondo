import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Radar, MessageSquarePlus, Trash2, Search, ShieldAlert, Store, Workflow, BookOpen, Mail, ChartNoAxesCombined, Settings2, Plus, X, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import SEOHead from '@/components/SEOHead';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { BrunoAgentChat, type AgentConfig } from '@/components/erp/BrunoAgentChat';
import { loadThreads, newThread, saveThreads, type BrunoThread } from '@/lib/brunoThreads';
import { MarioOperations, marioAction } from '@/components/erp/MarioOperations';
import { MarioDirectory, MARIO_STATUS, type MarioProspect } from '@/components/erp/MarioDirectory';
import { MarioDelivery, type MarioSettings } from '@/components/erp/MarioDelivery';

const KEY = 'mario-agent-threads';
const MARIO: AgentConfig = {
  fn: 'mario-chat', name: 'Mario', icon: Radar, instructionsKey: 'mario-agent-instructions',
  description: 'Outbound Partnership & Customers: trova pizzerie e aziende Horeca in UK, Francia e Germania e gestisce le sequenze email.',
  suggestions: [
    'Cerca 5 pizzerie a Londra e salva i candidati da verificare',
    'Quanti partner hanno risposto questa settimana?',
    'Scrivi l’email di avvio per un distributore Horeca francese',
    'Come sta andando la sequenza in UK?',
  ],
};

export default function ERPMario() {
  const [params, setParams] = useSearchParams();
  const [threads, setThreads] = useState<BrunoThread[]>(() => { const t=loadThreads(KEY); if(t.length)return t;const first=[newThread()];saveThreads(first,KEY);return first; });
  const [revision,setRevision]=useState(0);const [selected,setSelected]=useState<MarioProspect|null>(null);const [settings,setSettings]=useState<MarioSettings|null>(null);const [admin,setAdmin]=useState(false);const [error,setError]=useState('');const [eligibility,setEligibility]=useState('unreviewed');const [note,setNote]=useState('');
  const section=params.get('section');const prospectId=params.get('prospect');const panel=Boolean(section||prospectId);const [mobile,setMobile]=useState(false);
  const activeThread=threads.find(t=>t.id===params.get('chat'))??threads[0];
  const navigate=(next:Record<string,string|null>)=>setParams(prev=>{const p=new URLSearchParams(prev);for(const [k,v] of Object.entries(next)){if(v===null)p.delete(k);else p.set(k,v);}return p;});
  const updateThread=useCallback((t:BrunoThread)=>setThreads(prev=>{const next=[t,...prev.filter(x=>x.id!==t.id)];saveThreads(next,KEY);return next;}),[]);
  const refresh=useCallback(()=>setRevision(n=>n+1),[]);
  useEffect(()=>{let live=true;marioAction({action:'overview'}).then(d=>{if(live){setSettings(d.settings);setAdmin(d.is_admin);}}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[revision]);
  useEffect(()=>{if(!prospectId){setSelected(null);return;}const controller=new AbortController();supabase.from('outreach_prospects').select('*').eq('id',prospectId).single().abortSignal(controller.signal).then(({data,error})=>{if(controller.signal.aborted)return;if(error)setError('Impossibile caricare il contatto.');else{const p=data as unknown as MarioProspect;setSelected(p);setEligibility(p.recipient_eligibility);setNote(p.eligibility_note??'');}});return()=>controller.abort();},[prospectId,revision]);
  const createThread=()=>{const t=newThread();setThreads(prev=>{const next=[t,...prev];saveThreads(next,KEY);return next;});navigate({chat:t.id});setMobile(false);};
  const deleteThread=(id:string)=>setThreads(prev=>{let next=prev.filter(t=>t.id!==id);if(!next.length)next=[newThread()];saveThreads(next,KEY);return next;});
  const open=(view:string)=>{navigate({section:view,prospect:null});setMobile(true);};
  const act=async(body:Record<string,unknown>)=>{setError('');try{await marioAction(body);refresh();}catch(e){setError((e as Error).message);}};
  return <div className="bruno-workspace flex h-[calc(100dvh-3.5rem)] min-h-0 w-full min-w-0 flex-col overflow-hidden bg-background text-foreground">
    <SEOHead title="Mario AI | ERP" description="Contatti, email e risultati outbound Vesuviano"/>
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-4 py-3"><h1 className="flex items-center gap-2 text-xl font-semibold"><Radar className="h-5 w-5 text-primary"/>Mario <span className="hidden text-sm font-normal text-muted-foreground sm:inline">Partnership & Customers</span></h1><div className="flex flex-wrap gap-2"><Badge variant="secondary">Invii in pausa</Badge><Badge variant="outline">Max {settings?.daily_limit??100} email/giorno</Badge></div></header>
    <nav className="flex shrink-0 flex-wrap items-center gap-1 border-b px-3 py-2"><Button size="sm" variant={mobile?'ghost':'secondary'} onClick={()=>{setMobile(false);navigate({section:null,prospect:null});}}><MessageSquarePlus className="mr-1.5 h-4 w-4"/>Chat</Button>{[['contacts','Contatti',Store],['drafts','Sequenze',Workflow],['templates','Email HTML',Mail],['kpi','KPI',ChartNoAxesCombined],['research','Ricerca',Search],['settings','Impostazioni',Settings2]].map(([key,label,Icon])=>{const I=Icon as typeof Store;return <Button key={String(key)} size="sm" variant={section===key?'secondary':'ghost'} onClick={()=>open(String(key))}><I className="mr-1.5 h-4 w-4"/>{String(label)}</Button>;})}</nav>
    {error&&<p role="alert" className="shrink-0 border-b px-4 py-2 text-xs text-destructive">{error}</p>}
    <div className={cn('grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[180px_minmax(0,1fr)]',panel&&'xl:grid-cols-[180px_minmax(0,1fr)_minmax(380px,440px)]')}>
      <aside className="hidden min-h-0 min-w-0 flex-col border-r lg:flex"><Button className="m-3" size="sm" onClick={createThread}><Plus className="mr-1.5 h-4 w-4"/>Nuova chat</Button><div className="min-h-0 flex-1 overflow-y-auto">{threads.map(t=><div key={t.id} className={cn('group flex min-w-0 items-center border-b',activeThread?.id===t.id&&'bg-muted')}><Button variant="ghost" className="h-auto min-w-0 flex-1 justify-start rounded-none px-3 py-3 text-left" onClick={()=>{navigate({chat:t.id});setMobile(false);}}><span className="min-w-0"><span className="block truncate text-xs font-medium">{t.title}</span><span className="mt-1 block text-[11px] text-muted-foreground">{new Date(t.updatedAt).toLocaleDateString('it-IT')}</span></span></Button><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground" title="Elimina chat" aria-label="Elimina chat" onClick={()=>deleteThread(t.id)}><Trash2 className="h-3 w-3"/></Button></div>)}</div><Button variant="ghost" size="sm" className="m-2 justify-start" onClick={()=>open('knowledge')}><BookOpen className="mr-2 h-4 w-4"/>Conoscenze</Button></aside>
      <main className={cn('min-h-0 min-w-0 overflow-hidden',mobile&&panel?'hidden xl:block':'block',panel&&'lg:col-start-2 lg:row-start-1')}>{activeThread&&<BrunoAgentChat key={activeThread.id} thread={activeThread} onChange={updateThread} agent={{...MARIO,description:'Vesuviano Forni · pizzerie e partner Horeca',onInstructions:()=>open('instructions'),onComplete:refresh}}/>}</main>
      {panel&&<aside className={cn('min-h-0 min-w-0 overflow-y-auto border-l p-4',mobile?'block':'hidden xl:block','lg:col-start-2 lg:row-start-1 xl:col-start-3')}><div className="mb-3 flex items-center justify-between"><p className="text-xs font-semibold uppercase text-muted-foreground">{prospectId?'Scheda contatto':'Mario · attività'}</p><Button size="icon" variant="ghost" title="Chiudi pannello" aria-label="Chiudi pannello" onClick={()=>{navigate({section:null,prospect:null});setMobile(false);}}><X className="h-4 w-4"/></Button></div>
        {section==='contacts'?<MarioDirectory revision={revision} onSelect={p=>{setSelected(p);navigate({prospect:p.id,section:null});setMobile(true);}}/>:['kpi','templates','settings'].includes(section??'')?<MarioDelivery key={section} view={section??'settings'} onUpdated={refresh}/>:prospectId?selected?<div className="space-y-4"><Button size="sm" variant="ghost" onClick={()=>open('contacts')}><ArrowLeft className="mr-1 h-4 w-4"/>Archivio</Button><div><h2 className="break-words text-xl font-semibold">{selected.name}</h2><p className="text-sm text-muted-foreground">{selected.kind==='partner'?'Partner Horeca':'Pizzeria'} · {selected.city??'—'} · {selected.country}</p></div><div className="space-y-2 border-y py-3 text-sm"><p className="break-all">{selected.email??'Email da verificare'}</p>{selected.phone&&<p>{selected.phone}</p>}{selected.contact_name&&<p>{selected.contact_name}</p>}{selected.website&&<a href={selected.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 break-all text-primary underline">Sito ufficiale<ExternalLink className="h-3 w-3"/></a>}<p className="text-xs text-muted-foreground">{MARIO_STATUS[selected.status]??selected.status} · {selected.step} email accettate dal server</p></div><Badge variant="secondary">{selected.qualified?'Pertinenza verificata':'Da verificare'}</Badge>{selected.summary&&<p className="text-sm">{selected.summary}</p>}{selected.qualification_reason&&<p className="text-xs text-muted-foreground">{selected.qualification_reason}</p>}
          <details className="border-b pb-3"><summary className="cursor-pointer text-sm font-medium">Fonti e verifica</summary><pre className="mt-2 whitespace-pre-wrap break-all text-xs text-muted-foreground">{JSON.stringify(selected.evidence,null,2)}</pre></details>
          <div className="space-y-2 border-b pb-4"><p className="text-sm font-semibold">Idoneità invio</p><p className="text-xs text-muted-foreground">{selected.recipient_eligibility==='eligible'?'Valutazione registrata':'Da valutare · email pubblica ≠ autorizzazione'}</p>{admin&&<><select aria-label="Idoneità destinatario" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={eligibility} onChange={e=>setEligibility(e.target.value)}><option value="unreviewed">Da valutare</option><option value="eligible">Idoneo · valutazione documentata</option><option value="blocked">Bloccato</option></select><Textarea aria-label="Motivazione idoneità" placeholder="Base e riferimento della valutazione" minLength={10} value={note} onChange={e=>setNote(e.target.value)}/><Button size="sm" variant="outline" disabled={note.trim().length<10} onClick={()=>void act({action:'eligibility',id:selected.id,recipient_eligibility:eligibility,eligibility_note:note})}>Registra valutazione</Button></>}</div>
          <MarioOperations key={selected.id} prospectId={selected.id} initialTab="drafts" onUpdated={refresh}/><Button variant="ghost" size="sm" className="text-destructive" onClick={()=>void act({action:'suppress',id:selected.id,reason:'Esclusione manuale dal team'})}><ShieldAlert className="mr-1.5 h-4 w-4"/>Escludi dai contatti</Button>
        </div>:<p className="text-sm text-muted-foreground">Caricamento contatto…</p>:<MarioOperations key={section} initialTab={section??'research'} onUpdated={refresh}/>}
      </aside>}
    </div>
  </div>;
}
