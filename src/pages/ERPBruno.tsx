import { useCallback,useEffect,useState } from 'react';
import { Bot,LayoutDashboard,ClipboardList,History,MessageSquare,Phone,Settings,Plus,Trash2 } from 'lucide-react';
import { useSearchParams } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import { BrunoOperations } from '@/components/erp/BrunoOperations';
import { BrunoAgentChat } from '@/components/erp/BrunoAgentChat';
import { BrunoVoice } from '@/components/erp/BrunoVoice';
import { BrunoKnowledge } from '@/components/erp/BrunoKnowledge';
import { MailboxSettings } from '@/components/erp/MailboxSettings';
import { TelegramLink } from '@/components/erp/TelegramLink';
import { loadThreads,newThread,saveThreads,type BrunoThread } from '@/lib/brunoThreads';

const agentViews=[{id:'plan',label:'Piano',icon:ClipboardList},{id:'history',label:'Storico',icon:History},{id:'chat',label:'Chat con Bruno',icon:MessageSquare},{id:'calls',label:'Chiamate',icon:Phone}];
export default function ERPBruno(){
 const [params,setParams]=useSearchParams();
 const requested=params.get('view');
 const view=requested&&['overview','plan','history','chat','calls','communications','settings'].includes(requested)?requested:params.get('lead')?'communications':params.get('chat')?'chat':'overview';
 useEffect(()=>{if(view!=='communications')return;const q=new URLSearchParams(params);q.delete('view');const qs=q.toString();window.location.replace(`/erp/chat${qs?`?${qs}`:''}`)},[view,params]);
 const agent=agentViews.some(v=>v.id===view);
 const navigate=(next:string)=>setParams(p=>{const n=new URLSearchParams(p);n.set('view',next);if(next!=='communications')n.delete('lead');return n});
 const [threads,setThreads]=useState<BrunoThread[]>(()=>{const existing=loadThreads();if(existing.length)return existing;const first=[newThread()];saveThreads(first);return first});
 const active=threads.find(t=>t.id===params.get('chat'))??threads[0];
 const update=useCallback((t:BrunoThread)=>setThreads(prev=>{const next=[t,...prev.filter(x=>x.id!==t.id)];saveThreads(next);return next}),[]);
 const open=(id:string)=>setParams(p=>{const n=new URLSearchParams(p);n.set('view','chat');n.set('chat',id);n.delete('lead');return n});
 const create=()=>{const t=newThread();update(t);open(t.id)};
 const remove=(id:string)=>{let next=threads.filter(t=>t.id!==id);if(!next.length)next=[newThread()];saveThreads(next);setThreads(next);if(active?.id===id&&next[0])open(next[0].id)};
 return <div className="bruno-workspace flex h-[calc(100dvh-3.5rem)] min-h-0 min-w-0 flex-col overflow-hidden bg-background text-foreground">
  <header className="shrink-0 border-b px-4 py-4 md:px-6"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-primary"><Bot className="h-6 w-6"/></span><div><h1 className="text-xl font-semibold">Bruno</h1><p className="text-xs text-muted-foreground">Sales & Back-office</p></div></div><nav aria-label="Sezioni Bruno" className="flex flex-wrap gap-1">{[{id:'overview',label:'Panoramica',icon:LayoutDashboard},{id:'plan',label:'Agente',icon:Bot},{id:'settings',label:'Impostazioni',icon:Settings}].map(item=><Button key={item.id} variant={(item.id==='plan'?agent:view===item.id)?'secondary':'ghost'} size="sm" onClick={()=>navigate(item.id)}><item.icon className="mr-2 h-4 w-4"/>{item.label}</Button>)}</nav></div></header>
  {agent&&<nav aria-label="Viste agente" className="flex shrink-0 flex-wrap gap-1 border-b px-4 py-2 md:px-6">{agentViews.map(v=><Button key={v.id} variant={view===v.id?'secondary':'ghost'} size="sm" onClick={()=>navigate(v.id)}><v.icon className="mr-2 h-4 w-4"/>{v.label}</Button>)}</nav>}
  <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
   {(view==='overview'||view==='plan'||view==='history')&&<BrunoOperations key={view} view={view} onNavigate={navigate}/>}
   {view==='calls'&&<BrunoVoice embedded/>}
   {view==='chat'&&<div className="grid h-full min-h-0 min-w-0 md:grid-cols-[240px_minmax(0,1fr)]"><aside className="flex min-h-0 min-w-0 flex-col border-b md:border-b-0 md:border-r"><div className="p-3"><Button className="w-full" onClick={create}><Plus className="mr-2 h-4 w-4"/>Nuova chat</Button></div><div className="max-h-36 overflow-y-auto md:max-h-none md:flex-1">{threads.map(t=><div key={t.id} className="flex items-center border-b"><Button variant={active?.id===t.id?'secondary':'ghost'} onClick={()=>open(t.id)} className="h-auto min-w-0 flex-1 justify-start rounded-none px-3 py-3 text-left"><span className="min-w-0"><span className="block truncate">{t.title}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{new Date(t.updatedAt).toLocaleDateString('it-IT')}</span></span></Button><Button variant="ghost" size="icon" aria-label="Elimina chat" onClick={()=>remove(t.id)}><Trash2 className="h-3 w-3"/></Button></div>)}</div></aside><div className="min-h-0 min-w-0">{active&&<BrunoAgentChat key={active.id} thread={active} onChange={update}/>}</div></div>}
   {view==='settings'&&<div className="space-y-8 p-4 md:p-6"><h2 className="text-xl font-semibold">Impostazioni Bruno</h2><section className="space-y-3 border-b pb-6"><h3 className="font-semibold">Conoscenze e materiali</h3><div className="flex flex-wrap gap-3"><BrunoKnowledge/><Button variant="outline" asChild><a href="/erp/materiali">Materiali</a></Button></div></section><section className="space-y-3 border-b pb-6"><h3 className="font-semibold">Canali collegati</h3><div className="flex flex-wrap gap-3"><MailboxSettings/><TelegramLink/></div></section><section className="space-y-3"><h3 className="font-semibold">Telefonia</h3><p className="text-sm text-muted-foreground">+44 7457 416033 · Inglese · Registrazione e trascrizione</p><Button variant="outline" onClick={()=>navigate('calls')}><Phone className="mr-2 h-4 w-4"/>Chiamate</Button></section></div>}
  </main>
 </div>;
}