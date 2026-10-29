import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Sparkles, Send, FlaskConical, Trash2, Users, Mail } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const db = supabase as any;
const LANGS = [['it', 'Italiano'], ['en', 'Inglese'], ['fr', 'Francese'], ['de', 'Tedesco'], ['es', 'Spagnolo']];
const STAGES = [['nuovo', 'Nuovo'], ['pre_qualificato', 'Pre-qualificato'], ['qualificato', 'Qualificato'], ['trattativa', 'Trattativa'], ['vinto', 'Vinto (clienti)']];
const STATUS: Record<string, string> = { draft: 'Bozza', sending: 'In invio', sent: 'Inviata', failed: 'Errore' };

type Campaign = {
  id: string; title: string; prompt: string | null; language: string; subject: string; preheader: string; body: string;
  image_url: string | null; extra_images: string[]; cta_label: string | null; cta_url: string | null; audience: { stages: string[]; countries: string[] };
  status: string; recipients_count: number; sent_count: number; failed_count: number; created_at: string; sent_at: string | null; last_error: string | null;
};

async function call(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('newsletter', { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) { try { msg = (await error.context.json()).error || msg; } catch { /* keep */ } }
    throw new Error(typeof msg === 'string' ? msg : 'Errore');
  }
  return data;
}

export default function ERPNewsletter() {
  const [list, setList] = useState<Campaign[]>([]);
  const [sel, setSel] = useState<Campaign | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState('');
  const [count, setCount] = useState<number | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [assets, setAssets] = useState<{ url: string; label: string }[]>([]);
  const [assetFilter, setAssetFilter] = useState('');

  const load = async () => {
    const { data } = await db.from('newsletter_campaigns').select('*').order('created_at', { ascending: false });
    setList(data || []);
    if (sel) setSel((data || []).find((c: Campaign) => c.id === sel.id) || null);
  };
  useEffect(() => { load(); supabase.auth.getUser().then(({ data }) => setTestEmail(data.user?.email || '')); }, []);
  useEffect(() => {
    if (!list.some((c) => c.status === 'sending')) return;
    const t = setInterval(load, 4000); return () => clearInterval(t);
  }, [list]);

  const refreshPreview = async (c: Campaign) => {
    if (!c.body) { setPreview(''); return; }
    try { setPreview((await call({ action: 'preview', campaign_id: c.id })).html); } catch { /* ignore */ }
  };
  const refreshCount = async (a: Campaign['audience']) => {
    setCount(null);
    try { setCount((await call({ action: 'audience', audience: a })).count); } catch (e: any) { toast.error(e.message); }
  };
  useEffect(() => {
    if (!sel) return;
    call({ action: 'assets', language: sel.language }).then((r) => setAssets(r.images || [])).catch(() => setAssets([]));
  }, [sel?.id, sel?.language]);
  const pickImage = (url: string, extra: boolean) => {
    if (!sel) return;
    if (!extra) return patch({ image_url: url, extra_images: (sel.extra_images || []).filter((u) => u !== url) });
    const cur = sel.extra_images || [];
    patch({ extra_images: cur.includes(url) ? cur.filter((u) => u !== url) : [...cur, url].slice(0, 3) });
  };
  useEffect(() => { if (sel) { refreshPreview(sel); refreshCount(sel.audience); } else setPreview(''); }, [sel?.id]);

  const create = async () => {
    const { data, error } = await db.from('newsletter_campaigns').insert({ title: 'Nuova campagna' }).select().single();
    if (error) return toast.error(error.message);
    setList([data, ...list]); setSel(data);
  };
  const patch = (p: Partial<Campaign>) => sel && setSel({ ...sel, ...p });
  const save = async (c = sel) => {
    if (!c) return;
    const { title, subject, preheader, body, image_url, extra_images, cta_label, cta_url, audience, language, prompt } = c;
    const { error } = await db.from('newsletter_campaigns').update({ title, subject, preheader, body, image_url, extra_images, cta_label, cta_url, audience, language, prompt }).eq('id', c.id);
    if (error) throw error;
    await load(); await refreshPreview(c);
  };
  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key); try { await fn(); } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  const editable = sel?.status === 'draft';
  const toggleStage = (s: string) => {
    if (!sel) return;
    const stages = sel.audience.stages.includes(s) ? sel.audience.stages.filter((x) => x !== s) : [...sel.audience.stages, s];
    const audience = { ...sel.audience, stages }; patch({ audience }); refreshCount(audience);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <SEOHead title="Newsletter | ERP" description="Campagne newsletter" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h1 className="text-2xl font-bold">Newsletter</h1>
          <p className="text-sm text-muted-foreground">Inviate con Resend · le risposte arrivano a info@vesuvianoforni.com</p></div>
        <Button onClick={create}><Plus className="h-4 w-4 mr-1" />Nuova campagna</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card><CardContent className="p-2 space-y-1 max-h-[75vh] overflow-auto">
          {list.length === 0 && <p className="text-sm text-muted-foreground p-3">Nessuna campagna. Creane una.</p>}
          {list.map((c) => (
            <button key={c.id} onClick={() => setSel(c)} className={`w-full text-left rounded-md p-3 transition-colors ${sel?.id === c.id ? 'bg-accent' : 'hover:bg-muted'}`}>
              <div className="flex items-center justify-between gap-2"><span className="font-medium truncate">{c.title}</span>
                <Badge variant={c.status === 'sent' ? 'default' : c.status === 'failed' ? 'destructive' : 'secondary'}>{STATUS[c.status]}</Badge></div>
              <p className="text-xs text-muted-foreground mt-1">{new Date(c.sent_at || c.created_at).toLocaleDateString('it-IT')} · {c.language.toUpperCase()}
                {c.status !== 'draft' && ` · ${c.sent_count}/${c.recipients_count}`}</p>
            </button>))}
        </CardContent></Card>

        {!sel ? <Card><CardContent className="p-10 text-center text-muted-foreground"><Mail className="h-10 w-10 mx-auto mb-3 opacity-40" />Seleziona o crea una campagna</CardContent></Card> : (
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-4 min-w-0">
              {editable && <Card><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Crea con AI</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Textarea rows={3} placeholder="Es: proponi gli slot di produzione prima di Natale ai clienti qualificati, con foto del forno rotante e link al catalogo"
                    value={sel.prompt || ''} onChange={(e) => patch({ prompt: e.target.value })} />
                  <div className="flex flex-wrap gap-2">
                    <Select value={sel.language} onValueChange={(v) => patch({ language: v })}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>{LANGS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select>
                    <Button disabled={!!busy || (sel.prompt || '').length < 3} onClick={() => run('gen', async () => {
                      const { campaign } = await call({ action: 'generate', campaign_id: sel.id, prompt: sel.prompt, language: sel.language });
                      setSel(campaign); await load(); await refreshPreview(campaign); toast.success('Bozza generata');
                    })}>{busy === 'gen' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}Genera</Button>
                  </div>
                </CardContent></Card>}

              <Card><CardHeader className="pb-2"><CardTitle className="text-base">Contenuto</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><Label>Nome interno</Label><Input disabled={!editable} value={sel.title} onChange={(e) => patch({ title: e.target.value })} /></div>
                  <div><Label>Oggetto</Label><Input disabled={!editable} value={sel.subject} onChange={(e) => patch({ subject: e.target.value })} /></div>
                  <div><Label>Anteprima (preheader)</Label><Input disabled={!editable} value={sel.preheader} onChange={(e) => patch({ preheader: e.target.value })} /></div>
                  <div><Label>Testo</Label><Textarea disabled={!editable} rows={9} value={sel.body} onChange={(e) => patch({ body: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Foto dal sito</Label>
                    <p className="text-xs text-muted-foreground">Clic = foto principale · clic destro = aggiungi/togli tra le foto aggiuntive (max 3)</p>
                    <Input value={assetFilter} onChange={(e) => setAssetFilter(e.target.value)} placeholder="Cerca: pronta consegna, Ottavio, rotante…" />
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-auto">
                      {assets.filter((a) => a.label.toLowerCase().includes(assetFilter.toLowerCase())).map((a) => {
                        const main = sel.image_url === a.url; const extra = (sel.extra_images || []).includes(a.url);
                        return <button key={a.url} type="button" disabled={!editable} title={a.label}
                          onClick={() => pickImage(a.url, false)} onContextMenu={(e) => { e.preventDefault(); pickImage(a.url, true); }}
                          className={`relative aspect-square rounded overflow-hidden border-2 ${main ? 'border-primary' : extra ? 'border-accent-foreground' : 'border-transparent'}`}>
                          <img src={a.url} alt={a.label} loading="lazy" className="w-full h-full object-cover" />
                          {(main || extra) && <span className="absolute top-0.5 left-0.5 text-[10px] px-1 rounded bg-background">{main ? 'Principale' : '+'}</span>}
                        </button>;
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Testo pulsante</Label><Input disabled={!editable} value={sel.cta_label || ''} onChange={(e) => patch({ cta_label: e.target.value })} /></div>
                    <div><Label>Link pulsante</Label><Input disabled={!editable} value={sel.cta_url || ''} onChange={(e) => patch({ cta_url: e.target.value })} /></div>
                  </div>
                  {editable && <div className="flex gap-2">
                    <Button variant="outline" disabled={!!busy} onClick={() => run('save', async () => { await save(); toast.success('Salvata'); })}>Salva</Button>
                    <Button variant="ghost" disabled={!!busy} onClick={() => run('del', async () => { await db.from('newsletter_campaigns').delete().eq('id', sel.id); setSel(null); await load(); })}><Trash2 className="h-4 w-4" /></Button>
                  </div>}
                </CardContent></Card>

              <Card><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />Destinatari</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-3">{STAGES.map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2 text-sm"><Checkbox disabled={!editable} checked={sel.audience.stages.includes(v)} onCheckedChange={() => toggleStage(v)} />{l}</label>))}</div>
                  <div><Label>Paesi (separati da virgola, vuoto = tutti)</Label>
                    <Input disabled={!editable} value={sel.audience.countries.join(', ')} onChange={(e) => patch({ audience: { ...sel.audience, countries: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } })}
                      onBlur={() => refreshCount(sel.audience)} placeholder="Es: UK, France" /></div>
                  <p className="text-sm">{count === null ? <Loader2 className="h-4 w-4 animate-spin inline" /> : <><strong>{count}</strong> contatti (esclusi persi, disiscritti e doppioni)</>}</p>
                </CardContent></Card>

              <Card><CardContent className="p-4 space-y-3">
                {sel.status === 'draft' ? <>
                  <div className="flex flex-wrap gap-2">
                    <Input className="flex-1 min-w-48" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="Email per la prova" />
                    <Button variant="outline" disabled={!!busy || !sel.body || !testEmail} onClick={() => run('test', async () => {
                      await save(); await call({ action: 'test', campaign_id: sel.id, email: testEmail }); toast.success(`Prova inviata a ${testEmail}`);
                    })}>{busy === 'test' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <FlaskConical className="h-4 w-4 mr-1" />}Invia prova</Button>
                  </div>
                  <Button className="w-full" disabled={!!busy || !sel.body || !sel.subject || !count} onClick={() => setConfirm(true)}><Send className="h-4 w-4 mr-1" />Invia a {count ?? '…'} contatti</Button>
                </> : <div className="text-sm space-y-1">
                  <p><strong>{STATUS[sel.status]}</strong> · inviate {sel.sent_count} su {sel.recipients_count}{sel.failed_count ? ` · errori ${sel.failed_count}` : ''}</p>
                  {sel.last_error && <p className="text-destructive">{sel.last_error}</p>}
                </div>}
              </CardContent></Card>
            </div>

            <Card className="min-w-0"><CardHeader className="pb-2"><CardTitle className="text-base">Anteprima</CardTitle>
              {sel.subject && <p className="text-sm"><strong>{sel.subject}</strong> <span className="text-muted-foreground">— {sel.preheader}</span></p>}</CardHeader>
              <CardContent>{preview ? <iframe title="Anteprima" sandbox="" srcDoc={preview} className="w-full h-[75vh] rounded border bg-background" />
                : <p className="text-sm text-muted-foreground">Genera o scrivi il testo per vedere l'anteprima.</p>}</CardContent></Card>
          </div>)}
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Inviare la newsletter?</AlertDialogTitle>
          <AlertDialogDescription>Verrà inviata a {count} contatti da newsletter@vesuvianoforni.com con risposte a info@vesuvianoforni.com. L'invio non si può annullare.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={() => sel && run('send', async () => {
              await save(); const r = await call({ action: 'send', campaign_id: sel.id }); toast.success(`Invio avviato a ${r.recipients} contatti`); await load();
            })}>Invia</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
