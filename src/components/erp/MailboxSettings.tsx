import { useState } from 'react';
import { Mail, RefreshCw, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailSignatures } from './EmailSignatures';

const errors: Record<string,string> = {
  MAIL_SIGNATURE_INVALID:'La firma selezionata non è più disponibile. Scegline un’altra.',
  MAIL_AUTH_FAILED:'Il server di posta non accetta le credenziali. Controlla la password e il nome della casella.',
  MAIL_TLS_FAILED:'Il certificato del server di posta non è valido.',
  MAIL_TIMEOUT:'Il server di posta non ha risposto in tempo.',
  MAIL_CONNECTION_REFUSED:'Connessione al server di posta rifiutata.',
  MAIL_CONFIG_MISSING:'Mancano i dati protetti del server di posta.',
  SMTP_PORT_UNSUPPORTED:'Questo servizio richiede SMTP sicuro sulla porta 465; la porta 587 non è disponibile.',
  IMAP_PORT_UNSUPPORTED:'Questo servizio richiede IMAP sicuro sulla porta 993.',
  SENT_FOLDER_AMBIGUOUS:'La cartella Posta inviata non è identificabile con certezza.',
  MAILBOX_DISABLED:'La sincronizzazione della casella è disattivata.',
  MAILBOX_BUSY:'La casella è già occupata da un invio o una sincronizzazione.',
  SMTP_UNKNOWN:'Esito SMTP non confermato: il messaggio non sarà reinviato automaticamente.',
  SENT_COPY_UNKNOWN:'La copia in Posta inviata non è confermata; l’email non verrà reinviata.',
  WORKER_INTERRUPTED:'Controllo interrotto; riprenderà dalla prima email non elaborata.',
  MAIL_OPERATION_FAILED:'Operazione non completata. Aggiorna lo stato della casella e controlla il registro.',
  MAIL_DB_FAILED:'Salvataggio non confermato. Verifica lo stato prima di effettuare un nuovo invio.',
  MAIL_IDEMPOTENCY_CONFLICT:'Questo invio è già registrato con un contenuto diverso.',
};
export const mailErrorLabel = (code:string) => errors[code] || code;
type State = {
  mailbox:{address:string;enabled:boolean;sent_folder:string|null;last_sync_at:string|null;last_error:string|null};
  runs:Array<{id:string;status:string;processed:number;linked:number;error_code:string|null;created_at:string}>;
  unlinked:number;pending_copies:number;unknown_submissions:number;config_ready:boolean;config_error:string|null;can_manage:boolean;
};
async function request(action:string,extra:Record<string,unknown>={}) {
  const {data,error}=await supabase.functions.invoke('email-sync',{body:{action,...extra}});
  if(error){
    let message=error.message;
    if(error instanceof FunctionsHttpError){try {const body=await error.context.json();message=body.error||message;}catch{/* no provider details */}}
    throw new Error(mailErrorLabel(message));
  }
  return data;
}
const dateLabel=(value:string|null)=>value ? new Date(value).toLocaleString('it-IT',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : 'Mai';

export function MailboxSettings() {
  const {toast}=useToast();
  const [state,setState]=useState<State|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const refresh=async()=>{const data=await request('status');setState(data);};
  const act=async(action:string,extra:Record<string,unknown>={})=>{
    setBusy(true);setError(null);
    try{
      const data=await request(action,extra);
      if(action==='test') toast({title:'IMAP e SMTP collegati',description:`Posta inviata: ${data.sent_folder}`});
      if(action==='sync') toast({title:'Sincronizzazione avviata'});
      await refresh();
    }catch(e){setError((e as Error).message);}finally{setBusy(false);}
  };
  return <Dialog onOpenChange={open=>{if(open)void act('status');}}>
    <DialogTrigger asChild><Button variant="outline" size="sm"><Mail className="mr-2 h-4 w-4"/>Casella email</Button></DialogTrigger>
    <DialogContent className="max-h-[85vh] w-[calc(100%-24px)] max-w-5xl overflow-y-auto">
      <DialogHeader><DialogTitle>info@vesuvianoforni.com</DialogTitle></DialogHeader>
      <Tabs defaultValue="mailbox">
      <TabsList><TabsTrigger value="mailbox">Casella e sincronizzazione</TabsTrigger><TabsTrigger value="signatures">Firme email</TabsTrigger></TabsList>
      <TabsContent value="mailbox" className="space-y-4 pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={state?.mailbox.enabled?'default':'secondary'}>{state?.mailbox.enabled?'Sincronizzazione attiva':'Sincronizzazione disattivata'}</Badge>
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4"/>Credenziali protette</span>
      </div>
      {(error||state?.config_error||state?.mailbox.last_error)&&<p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0"/>{error||mailErrorLabel(state?.config_error||state?.mailbox.last_error||'')}</p>}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Posta inviata</dt><dd className="break-words">{state?.mailbox.sent_folder||'Da identificare'}</dd>
        <dt className="text-muted-foreground">Ultima sincronizzazione</dt><dd>{dateLabel(state?.mailbox.last_sync_at||null)}</dd>
        <dt className="text-muted-foreground">Email non associate</dt><dd>{state?.unlinked||0}</dd>
        <dt className="text-muted-foreground">Copie da verificare</dt><dd>{state?.pending_copies||0}</dd>
        <dt className="text-muted-foreground">Invii con esito incerto</dt><dd>{state?.unknown_submissions||0}</dd>
        <dt className="text-muted-foreground">Frequenza</dt><dd>Ogni 15 minuti</dd>
      </dl>
      <div className="flex flex-wrap gap-2 border-y py-3">
        <Button size="sm" variant="outline" disabled={busy} onClick={()=>void act('test')}>Verifica connessione</Button>
        <Button size="sm" disabled={busy||!state?.mailbox.enabled} onClick={()=>void act('sync')}><RefreshCw className="mr-2 h-4 w-4"/>Sincronizza</Button>
        <Button size="sm" variant="ghost" disabled={busy} aria-label="Aggiorna stato casella" onClick={()=>void act('status')}>{busy?<Loader2 className="h-4 w-4 animate-spin"/>:<RefreshCw className="h-4 w-4"/>}</Button>
        {state?.can_manage&&<Button size="sm" variant="outline" className="sm:ml-auto" disabled={busy||!state.config_ready||(!state.mailbox.enabled&&!state.mailbox.sent_folder)} onClick={()=>void act('enable',{enabled:!state.mailbox.enabled})}>{state.mailbox.enabled?'Disattiva':'Attiva'}</Button>}
      </div>
      <h3 className="text-sm font-semibold">Registro sincronizzazioni</h3>
      <div className="space-y-2">
        {!state?.runs.length&&<p className="text-sm text-muted-foreground">Nessuna sincronizzazione registrata.</p>}
        {state?.runs.map(run=><div key={run.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b pb-2 text-xs">
          <time className="text-muted-foreground">{dateLabel(run.created_at)}</time>
          <Badge variant={run.status==='failed'?'destructive':'secondary'}>{({success:'Completata',failed:'Non riuscita',running:'In corso',queued:'In attesa'} as Record<string,string>)[run.status]||run.status}</Badge>
          <span>{run.processed} email · {run.linked} associate</span>
          {run.error_code&&<span className="basis-full text-destructive">{mailErrorLabel(run.error_code)}</span>}
        </div>)}
      </div>
      </TabsContent>
      <TabsContent value="signatures" className="pt-3"><EmailSignatures/></TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>;
}