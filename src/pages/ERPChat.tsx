import { MessagesSquare } from 'lucide-react';
import { BrunoCommunications } from '@/components/erp/BrunoCommunications';

export default function ERPChat() {
  return <div className="bruno-workspace flex h-[calc(100dvh-3.5rem)] min-h-0 min-w-0 flex-col overflow-hidden bg-background text-foreground">
    <header className="shrink-0 border-b px-4 py-4 md:px-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-primary"><MessagesSquare className="h-6 w-6"/></span><div><h1 className="text-xl font-semibold">Chat</h1><p className="text-xs text-muted-foreground">WhatsApp e chiamate con i clienti</p></div></div></header>
    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain"><BrunoCommunications section="chat"/></main>
  </div>;
}
