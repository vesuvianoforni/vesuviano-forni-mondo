import { useEffect, useState } from 'react';
import { Plus, Save, Trash2, Loader2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { mailboxRequest, type MailSignature } from '@/lib/mailboxEmail';
import { useToast } from '@/hooks/use-toast';
import { EmailPreview } from './EmailPreview';

const emptySignature = { name: '', role: '', company: 'Vesuviano Forni', phone: '+39 081 1923 1684', whatsapp: '+39 350 928 6941', email: 'info@vesuvianoforni.com', website: 'https://vesuvianoforni.com', address: '', is_default: false };
type Draft = Omit<MailSignature, 'id'> & { id?: string };
const sample = 'Buongiorno,\n\ngrazie per averci contattato. Sarà un piacere aiutarla a scegliere il forno per il suo progetto.\n\nResto a disposizione.';
export function EmailSignatures() {
  const { toast } = useToast();
  const [signatures, setSignatures] = useState<MailSignature[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const reload = async (selected?: string) => {
    const result = await mailboxRequest('signatures');
    setSignatures(result.signatures);
    setDraft(result.signatures.find((s: MailSignature) => s.id === selected) || result.signatures[0] || { ...emptySignature, is_default: true });
  };
  useEffect(() => { void reload().catch(() => setError('Impossibile caricare le firme.')); }, []);
  const save = async () => {
    if (!draft) return;
    setBusy(true); setError('');
    try { const result = await mailboxRequest('save_signature', { signature: draft }); await reload(result.signature.id); toast({ title: 'Firma salvata' }); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!draft?.id) return;
    setBusy(true); setError('');
    try { await mailboxRequest('delete_signature', { id: draft.id }); await reload(); toast({ title: 'Firma eliminata' }); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-2">
      <Select value={draft?.id || 'new'} onValueChange={id => setDraft(signatures.find(s => s.id === id) || { ...emptySignature })} disabled={busy}>
        <SelectTrigger aria-label="Seleziona firma da modificare" className="min-w-0 flex-1"><SelectValue placeholder="Seleziona firma"/></SelectTrigger>
        <SelectContent>{signatures.map(s => <SelectItem key={s.id} value={s.id}>{s.name}{s.is_default ? ' · Predefinita' : ''}</SelectItem>)}<SelectItem value="new">Nuova firma</SelectItem></SelectContent>
      </Select>
      <Button variant="outline" size="sm" disabled={busy} onClick={() => setDraft({ ...emptySignature, is_default: signatures.length === 0 })}><Plus className="mr-2 h-4 w-4"/>Nuova firma</Button>
    </div>
    {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
    {draft ? <div className="grid min-w-0 gap-6 lg:grid-cols-2">
      <form className="min-w-0 space-y-4" onSubmit={e => { e.preventDefault(); void save(); }}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {([['name', 'Nome e cognome', 100], ['role', 'Ruolo', 150], ['company', 'Azienda', 100], ['phone', 'Telefono', 40], ['whatsapp', 'WhatsApp', 40], ['email', 'Email', 254], ['website', 'Sito web', 300]] as const).map(([key, label, max]) => <div key={key} className={key === 'website' ? 'sm:col-span-2' : ''}>
            <Label htmlFor={`signature-${key}`}>{label}</Label>
            <Input id={`signature-${key}`} value={draft[key]} maxLength={max} required={['name','company','email','website'].includes(key)} type={key === 'email' ? 'email' : key === 'website' ? 'url' : ['phone','whatsapp'].includes(key) ? 'tel' : 'text'} disabled={busy} onChange={e => setDraft({ ...draft, [key]: e.target.value })}/>
          </div>)}
        </div>
        <div><Label htmlFor="signature-address">Indirizzo postale · facoltativo</Label><Textarea id="signature-address" rows={2} maxLength={500} value={draft.address} disabled={busy} onChange={e => setDraft({ ...draft, address: e.target.value })}/></div>
        <div className="flex items-center gap-2"><Checkbox id="signature-default" disabled={busy} checked={draft.is_default} onCheckedChange={checked => setDraft({ ...draft, is_default: checked === true })}/><Label htmlFor="signature-default">Firma predefinita della casella</Label></div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={busy}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}Salva firma</Button>
          {draft.id && <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="ghost" size="icon" disabled={busy} aria-label="Elimina firma" title="Elimina firma"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Eliminare questa firma?</AlertDialogTitle><AlertDialogDescription>Le email già inviate mantengono la firma originale.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel><AlertDialogAction onClick={() => void remove()}>Elimina firma</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}
        </div>
      </form>
      <div className="min-w-0 space-y-2"><h3 className="flex items-center gap-2 text-sm font-medium"><PenLine className="h-4 w-4"/>Anteprima</h3><EmailPreview body={sample} signature={draft}/></div>
    </div> : <div role="status" className="py-10 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin"/></div>}
  </div>;
}

export function EmailSignatureSelector({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const [signatures, setSignatures] = useState<MailSignature[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { void mailboxRequest('signatures').then(result => setSignatures(result.signatures)).catch(() => setError('Firme non disponibili')); }, []);
  return <div className="min-w-0 flex-1">
    <Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger aria-label="Firma email" className="h-9 text-xs"><SelectValue/></SelectTrigger><SelectContent>
      <SelectItem value="default">Firma predefinita{signatures.find(s => s.is_default)?.name ? ` · ${signatures.find(s => s.is_default)?.name}` : ''}</SelectItem>
      {signatures.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}<SelectItem value="none">Senza firma</SelectItem>
    </SelectContent></Select>
    {error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
  </div>;
}