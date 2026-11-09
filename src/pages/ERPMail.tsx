import { Mail } from 'lucide-react';
import { BrunoCommunications } from '@/components/erp/BrunoCommunications';

export default function ERPMail() {
  return <div className="bruno-workspace flex h-[calc(100dvh-3.5rem)] min-h-0 min-w-0 flex-col overflow-hidden bg-background text-foreground">
    <header className="shrink-0 border-b px-4 py-4 md:px-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-primary"><Mail className="h-6 w-6" /></span><div className="min-w-0"><h1 className="text-xl font-semibold">Mail</h1><p className="break-words text-xs text-muted-foreground">info@vesuvianoforni.com</p></div></div></header>
    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain"><BrunoCommunications section="mail" /></main>
  </div>;
}