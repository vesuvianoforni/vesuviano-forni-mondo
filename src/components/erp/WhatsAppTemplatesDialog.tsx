import { useEffect, useState } from 'react';
import { FileCheck2, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type Tpl = { name: string; language: string; category: string; body: string; status?: string; reason?: string | null };
const LINES = [{ key: 'uk', label: 'Bruno UK' }, { key: 'it', label: 'Bruno IT' }] as const;
const STATUS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  APPROVED: { label: 'Approvato', variant: 'default' }, PENDING: { label: 'In revisione', variant: 'secondary' },
  IN_APPEAL: { label: 'In ricorso', variant: 'secondary' }, REJECTED: { label: 'Rifiutato', variant: 'destructive' },
  PAUSED: { label: 'In pausa', variant: 'outline' }, DISABLED: { label: 'Disattivato', variant: 'outline' },
};

export function WhatsAppTemplatesDialog() {
  const [open, setOpen] = useState(false);
  const [line, setLine] = useState<'uk' | 'it'>('uk');
  const [items, setItems] = useState<Tpl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    setLoading(true); setError(null);
    const { data, error } = await supabase.functions.invoke('bruno-agent', { body: { action: 'wa_templates', whatsapp_line: line, all: true } });
    if (error || data?.error) { setError(typeof data?.error === 'string' ? data.error : 'Impossibile leggere i modelli'); setItems([]); }
    else setItems(((data?.templates ?? []) as Tpl[]).sort((a, b) => a.name.localeCompare(b.name) || a.language.localeCompare(b.language)));
    setLoading(false);
  };
  useEffect(() => { if (open) void load(); }, [open, line]);
  const count = (s: string) => items.filter((t) => t.status === s).length;
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="outline" size="sm"><FileCheck2 className="mr-2 h-4 w-4"/>Modelli WhatsApp</Button></DialogTrigger>
    <DialogContent className="max-h-[85dvh] max-w-2xl overflow-hidden flex flex-col">
      <DialogHeader><DialogTitle>Modelli WhatsApp inviati a Meta</DialogTitle></DialogHeader>
      <div className="flex flex-wrap items-center gap-2">
        {LINES.map((l) => <Button key={l.key} size="sm" variant={line === l.key ? 'default' : 'outline'} onClick={() => setLine(l.key)}>{l.label}</Button>)}
        <Button size="sm" variant="ghost" onClick={() => void load()} disabled={loading}><RefreshCw className="mr-1 h-4 w-4"/>Aggiorna</Button>
        {!loading && !error && <span className="ml-auto text-xs text-muted-foreground">{count('APPROVED')} approvati · {count('PENDING')} in revisione · {count('REJECTED')} rifiutati</span>}
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {loading && <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Carico i modelli…</div>}
        {error && <p className="py-4 text-sm text-destructive">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="py-4 text-sm text-muted-foreground">Nessun modello su questa linea.</p>}
        {!loading && items.map((t) => { const s = STATUS[t.status ?? ''] ?? { label: t.status ?? '—', variant: 'outline' as const };
          return <div key={`${t.name}-${t.language}`} className="rounded-md border bg-card p-3">
            <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-medium">{t.name}</span><Badge variant="outline">{t.language}</Badge><Badge variant="outline">{t.category}</Badge><Badge variant={s.variant} className="ml-auto">{s.label}</Badge></div>
            {t.body && <p className="mt-2 whitespace-pre-wrap break-words text-xs text-muted-foreground">{t.body}</p>}
            {t.reason && t.reason !== 'NONE' && <p className="mt-1 text-xs text-destructive">Motivo: {t.reason}</p>}
          </div>; })}
      </div>
    </DialogContent>
  </Dialog>;
}
