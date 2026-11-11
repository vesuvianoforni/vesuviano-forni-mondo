import { useEffect, useMemo, useRef, useState } from 'react';
import { Delete, Loader2, Phone, UserPlus, UserRound } from 'lucide-react';
import type { CountryCode } from 'libphonenumber-js';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCRMCall } from '@/components/erp/CRMCallProvider';
import type { CRMLead } from '@/components/erp/CRMLeadCard';
import { DIAL_COUNTRIES, callingCode, countryName, flagOf, matchingDialContacts, parseDial } from '@/lib/dialPad';
import { resolveDialContact } from '@/lib/dialContacts.functions';

const KEYS: [string, string][] = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']];

export function DialPad({ leads, onLeadCreated, loading = false, loadError = null }: { leads: CRMLead[]; onLeadCreated: (lead: CRMLead) => void; loading?: boolean; loadError?: string | null }) {
  const call = useCRMCall();
  const resolveContact = useServerFn(resolveDialContact);
  const [value, setValue] = useState(''), [fallback, setFallback] = useState<CountryCode>('IT');
  const [name, setName] = useState(''), [saving, setSaving] = useState(false), [error, setError] = useState<string | null>(null);
  const press = useRef<number | null>(null), longPressed = useRef(false);
  const resolving = useRef(false);

  const parsed = useMemo(() => parseDial(value, fallback), [value, fallback]);
  const matches = useMemo(() => parsed.e164 ? matchingDialContacts(leads, parsed.e164) : [], [leads, parsed.e164]);
  const match = matches.length === 1 ? matches[0] : undefined;
  const suggestions = useMemo(() => {
    const digits = parsed.input.replace(/\D/g, '');
    if (match || digits.length < 4) return [];
    return leads.filter(l => (l.phone ?? '').replace(/\D/g, '').includes(digits.replace(/^0+/, ''))).slice(0, 4);
  }, [parsed.input, leads, match]);

  useEffect(() => { setError(null); }, [value]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input,textarea,[role=combobox]')) return;
      if (/^[\d*#+]$/.test(e.key)) setValue(v => v + e.key);
      else if (e.key === 'Backspace') setValue(v => v.slice(0, -1));
      else if (e.key === 'Enter') startCall();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const add = (k: string) => { if (navigator.vibrate) navigator.vibrate(8); setValue(v => v + k); };
  const down = (k: string) => {
    longPressed.current = false;
    if (k === '0') press.current = window.setTimeout(() => { longPressed.current = true; add('+'); }, 500);
  };
  const up = (k: string) => {
    if (press.current) { clearTimeout(press.current); press.current = null; }
    if (!longPressed.current) add(k);
  };

  async function startCall() {
    if (!call || call.occupied || !parsed.e164 || loading || loadError || resolving.current) return;
    resolving.current = true; setSaving(true); setError(null);
    try {
      const result = await resolveContact({ data: { destination: parsed.e164, name: name.trim() } });
      const lead = result.lead as unknown as CRMLead;
      onLeadCreated(lead); setName(''); call.openCall({ ...lead, phone: result.destination });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossibile verificare il cliente. Nessuna chiamata avviata.');
    } finally { resolving.current = false; setSaving(false); }
  }

  return <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">Prefisso se manca</span>
      <Select value={fallback} onValueChange={v => setFallback(v as CountryCode)}>
        <SelectTrigger className="h-8 w-auto gap-2" aria-label="Paese predefinito"><SelectValue /></SelectTrigger>
        <SelectContent>{DIAL_COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} {c.name} {callingCode(c.code)}</SelectItem>)}</SelectContent>
      </Select>
    </div>

    <div className="flex min-h-[7.5rem] flex-col items-center justify-center rounded-xl border bg-card px-3 py-3 text-center">
      <input value={parsed.formatted || value} inputMode="tel" aria-label="Numero da chiamare" placeholder="Digita il numero"
        onChange={e => setValue(e.target.value)} onPaste={e => { e.preventDefault(); setValue(e.clipboardData.getData('text')); }}
        className="w-full bg-transparent text-center text-3xl font-light tracking-wide outline-none placeholder:text-base placeholder:text-muted-foreground" />
      {value && <p className="mt-1 text-sm text-muted-foreground">
        {flagOf(parsed.country)} {countryName(parsed.country)}
        {parsed.type === 'MOBILE' ? ' · cellulare' : parsed.type === 'FIXED_LINE' ? ' · fisso' : ''}
        {!parsed.valid && value.length > 3 && <span className="text-destructive"> · numero incompleto</span>}
      </p>}
      {match && <a href={`/erp/crm?lead=${encodeURIComponent(match.id)}`} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary underline">
        <UserRound className="h-4 w-4" />{match.contact_name || match.company_name}</a>}
    </div>

    {suggestions.length > 0 && <ul className="space-y-1">{suggestions.map(l => <li key={l.id}>
      <Button variant="outline" className="h-auto w-full justify-between px-3 py-2 text-left text-sm" disabled={!call || call.occupied || saving || loading || Boolean(loadError)} onClick={() => call?.openCall(l)}>
        <span className="truncate">{l.contact_name || l.company_name}</span><span className="ml-2 shrink-0 text-muted-foreground">{l.phone}</span></Button></li>)}</ul>}

    {loading && <p role="status" className="text-center text-xs text-muted-foreground">Caricamento clienti…</p>}
    {loadError && <p role="alert" className="text-center text-sm text-destructive">Impossibile verificare i clienti: {loadError}</p>}
    {matches.length > 1 && <p role="alert" className="text-center text-sm text-destructive">Più clienti hanno questo numero: scegli la scheda dalla lista Clienti.</p>}
    {parsed.valid && !matches.length && !loading && !loadError && <div className="space-y-1">
      <p className="flex items-center gap-1 text-xs text-muted-foreground"><UserPlus className="h-3.5 w-3.5" />Nessuna corrispondenza nell’elenco caricato.</p>
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome (facoltativo)" className="h-10" />
    </div>}

    <div className="grid grid-cols-3 gap-3 select-none">
      {KEYS.map(([k, sub]) => <button key={k} type="button" aria-label={k === '0' ? '0, tieni premuto per +' : k}
        onPointerDown={() => down(k)} onPointerUp={() => up(k)} onPointerLeave={() => { if (press.current) { clearTimeout(press.current); press.current = null; } }}
        className="mx-auto flex h-[4.5rem] w-[4.5rem] touch-manipulation flex-col items-center justify-center rounded-full bg-muted text-2xl font-medium transition active:scale-95 active:bg-primary/20">
        {k}<span className="h-3 text-[10px] font-semibold tracking-widest text-muted-foreground">{sub}</span></button>)}
    </div>

    <div className="grid grid-cols-3 items-center gap-3">
      <span />
      <Button className="mx-auto h-[4.5rem] w-[4.5rem] rounded-full" aria-label="Chiama" onClick={startCall}
        disabled={!parsed.valid || saving || loading || Boolean(loadError) || matches.length > 1 || !call || call.occupied}>
        {saving ? <Loader2 className="h-7 w-7 animate-spin" /> : <Phone className="h-7 w-7" />}</Button>
      {value ? <Button variant="ghost" className="mx-auto h-14 w-14 rounded-full" aria-label="Cancella"
        onClick={() => setValue(v => v.slice(0, -1))} onContextMenu={e => { e.preventDefault(); setValue(''); }}>
        <Delete className="h-6 w-6" /></Button> : <span />}
    </div>
    {error && <p className="text-center text-sm text-destructive">{error}</p>}
    <p className="text-center text-xs text-muted-foreground">Chiami dal numero UK +44 7457 416033 · scegli Bruno AI o chiamata diretta</p>
  </div>;
}
