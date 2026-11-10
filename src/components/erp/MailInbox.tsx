import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Loader2, Mail, Search, UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@/lib/router-compat';
import { cn } from '@/lib/utils';
import { mailCorrespondent, mailRecipients, mailSearchTerm, type MailInboxItem } from '@/lib/mailInbox';

const PAGE_SIZE = 50;
const dateLabel = (value: string) => new Date(value).toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function MailInbox({ refreshKey = 0 }: { refreshKey?: number }) {
  const [items, setItems] = useState<MailInboxItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('all');
  const [selected, setSelected] = useState<MailInboxItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const generation = useRef(0);

  useEffect(() => {
    const request = ++generation.current;
    setLoading(true); setError(null);
    const timer = window.setTimeout(async () => {
      try {
        const { data: mailbox, error: mailboxError } = await supabase.from('email_mailboxes').select('id').eq('address', 'info@vesuvianoforni.com').single();
        if (mailboxError) throw mailboxError;
        if (!mailbox) throw new Error('Casella non disponibile.');
        let query = supabase.from('email_items').select('id,sender,recipients,subject,body,direction,sent_at,folder,lead_id', { count: 'exact' }).eq('mailbox_id', mailbox.id);
        if (folder === 'unlinked') query = query.is('crm_message_id', null);
        else if (folder !== 'all') query = query.eq('direction', folder);
        const term = mailSearchTerm(search);
        if (term) query = query.or(`sender.ilike.%${term}%,subject.ilike.%${term}%,body.ilike.%${term}%`);
        const { data, count, error: queryError } = await query.order('sent_at', { ascending: false }).order('id', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
        if (queryError) throw queryError;
        if (request !== generation.current) return;
        setItems(data ?? []); setTotal(count ?? 0);
      } catch {
        if (request === generation.current) setError('Impossibile caricare la posta importata.');
      } finally {
        if (request === generation.current) setLoading(false);
      }
    }, search ? 300 : 0);
    return () => { window.clearTimeout(timer); generation.current += 1; };
  }, [page, search, folder, refreshKey, retry]);

  return <div className="grid h-full min-h-0 min-w-0 overflow-hidden md:grid-cols-[340px_minmax(0,1fr)]">
    <section aria-label="Email importate" className={cn('flex min-h-0 min-w-0 flex-col overflow-hidden border-r', selected && 'hidden md:flex')}>
      <div className="shrink-0 space-y-2 border-b p-3">
        <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Cerca email importate" placeholder="Mittente, oggetto o testo…" className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} /></div>
        <Select value={folder} onValueChange={value => { setFolder(value); setPage(0); }}><SelectTrigger aria-label="Cartella email"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tutta la posta</SelectItem><SelectItem value="inbound">Ricevute</SelectItem><SelectItem value="outbound">Inviate</SelectItem><SelectItem value="unlinked">Non associate al CRM</SelectItem></SelectContent></Select>
        <p className="text-xs text-muted-foreground" aria-live="polite">{total} email</p>
      </div>
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        {loading ? <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin" aria-label="Caricamento email" /></div> : error ? <div className="space-y-3 p-4"><p role="alert" className="text-sm text-destructive">{error}</p><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Riprova</Button></div> : items.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">Nessuna email in questa vista.</p> : items.map(item => <Button key={item.id} variant="ghost" aria-pressed={selected?.id === item.id} onClick={() => setSelected(item)} className={cn('block h-auto w-full whitespace-normal rounded-none border-b border-l-[3px] border-l-transparent px-3 py-3.5 text-left font-normal', selected?.id === item.id && 'border-l-primary bg-accent/60')}>
          <span className="flex min-w-0 items-start gap-2">{item.direction === 'outbound' ? <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> : <ArrowDownLeft className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}<span className="min-w-0 flex-1 break-words text-xs font-semibold [overflow-wrap:anywhere]">{mailCorrespondent(item) || 'Senza indirizzo'}</span></span>
          <span className="mt-1.5 line-clamp-2 block break-words text-sm font-medium">{item.subject || '(Senza oggetto)'}</span><span className="mt-1 line-clamp-2 block break-words text-xs text-muted-foreground">{item.body}</span><time className="mt-2 block text-[11px] text-muted-foreground">{dateLabel(item.sent_at)}</time>
        </Button>)}
      </div>
      <div className="flex h-12 shrink-0 items-center justify-between border-t px-3"><Button size="icon" variant="ghost" aria-label="Email più recenti" disabled={page === 0 || loading} onClick={() => setPage(value => value - 1)}><ChevronLeft className="h-4 w-4" /></Button><span className="text-xs text-muted-foreground">{total ? page * PAGE_SIZE + 1 : 0}–{Math.min((page + 1) * PAGE_SIZE, total)} di {total}</span><Button size="icon" variant="ghost" aria-label="Email precedenti" disabled={(page + 1) * PAGE_SIZE >= total || loading} onClick={() => setPage(value => value + 1)}><ChevronRight className="h-4 w-4" /></Button></div>
    </section>
    <section aria-label="Dettaglio email importata" className={cn('flex min-h-0 min-w-0 flex-col overflow-hidden', !selected && 'hidden md:flex')}>
      {selected ? <><div className="shrink-0 space-y-3 border-b p-4 md:p-5"><Button size="sm" variant="ghost" className="md:hidden" onClick={() => setSelected(null)}><ArrowLeft className="mr-2 h-4 w-4" />Elenco email</Button><div className="flex flex-wrap items-start justify-between gap-3"><h2 className="min-w-0 flex-1 break-words text-lg font-semibold [overflow-wrap:anywhere]">{selected.subject || '(Senza oggetto)'}</h2>{selected.lead_id && <Button size="sm" variant="outline" asChild><Link to={`/erp/mail?lead=${encodeURIComponent(selected.lead_id)}`}><UserRound className="mr-2 h-4 w-4" />Cliente CRM</Link></Button>}</div><dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs"><dt className="text-muted-foreground">Da</dt><dd className="break-words [overflow-wrap:anywhere]">{selected.sender}</dd><dt className="text-muted-foreground">A</dt><dd className="break-words [overflow-wrap:anywhere]">{mailRecipients(selected.recipients).join(', ')}</dd><dt className="text-muted-foreground">Data</dt><dd>{dateLabel(selected.sent_at)}</dd></dl></div><div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-6"><p className="whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere]">{selected.body || '(Messaggio senza testo)'}</p></div></> : <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground"><Mail className="h-7 w-7" /><p className="text-sm">Seleziona un’email</p></div>}
    </section>
  </div>;
}