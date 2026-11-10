import { useCallback, useState } from 'react';
import { Mail } from 'lucide-react';
import { BrunoCommunications } from '@/components/erp/BrunoCommunications';
import { MailInbox } from '@/components/erp/MailInbox';
import { MailboxSettings } from '@/components/erp/MailboxSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from '@/lib/router-compat';

export default function ERPMail() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(value => value + 1), []);
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'mailbox' ? 'mailbox' : 'clients';
  const setView = (value: string) => setParams(current => {
    const next = new URLSearchParams(current);
    if (value === 'mailbox') next.set('view', 'mailbox'); else next.delete('view');
    return next;
  });
  return <div className="bruno-workspace flex h-[calc(100dvh-3.5rem)] min-h-0 min-w-0 flex-col overflow-hidden bg-background text-foreground">
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-4 md:px-6"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card text-primary"><Mail className="h-6 w-6" /></span><div className="min-w-0"><h1 className="text-xl font-semibold">Mail</h1><p className="break-words text-xs text-muted-foreground">info@vesuvianoforni.com</p></div></div><MailboxSettings importLabel onSynced={refresh} /></header>
    <Tabs value={view} onValueChange={setView} className="flex min-h-0 min-w-0 flex-1 flex-col gap-0">
      <div className="shrink-0 border-b px-3 py-2"><TabsList><TabsTrigger value="clients">Clienti</TabsTrigger><TabsTrigger value="mailbox">Casella email</TabsTrigger></TabsList></div>
      <TabsContent value="clients" className="m-0 min-h-0 min-w-0 flex-1 overflow-hidden"><BrunoCommunications section="mail" refreshKey={refreshKey} /></TabsContent>
      <TabsContent value="mailbox" className="m-0 min-h-0 min-w-0 flex-1 overflow-hidden"><MailInbox refreshKey={refreshKey} /></TabsContent>
    </Tabs>
  </div>;
}