import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

type Automation = { key: string; title: string; what: string; when: string; toggle: boolean; status?: 'always' | 'missing' };

export const BRUNO_AUTOMATIONS: Automation[] = [
  { key: 'ready_to_ship_offer', title: 'Offerta Pronta Consegna via email', what: 'Invia al cliente l’offerta con foto, prezzo, link PDF e prenotazione chiamata già compilata.', when: 'Subito, quando il cliente chiede un forno in pronta consegna dal sito.', toggle: false, status: 'always' },
  { key: 'ready_to_ship_followup', title: 'WhatsApp dopo l’offerta Pronta Consegna', what: 'Messaggio WhatsApp dalla linea di Gennaro per chiedere se l’offerta è arrivata e proporre una chiamata.', when: 'Dopo l’invio dell’offerta, in orario lavorativo (lun–sab).', toggle: true },
  { key: 'telegram_summaries', title: 'Riepiloghi Telegram mattina e sera', what: 'Riepilogo nel gruppo Ufficio AI di lead caldi, offerte e attività del giorno.', when: 'Ogni giorno lavorativo, mattina e sera.', toggle: true },
  { key: 'new_lead_welcome', title: 'Benvenuto nuovo lead con qualificazione', what: 'Primo contatto automatico per qualificare un nuovo lead generico.', when: 'Non ancora creato.', toggle: false, status: 'missing' },
];

export function BrunoAutomations() {
  const [state, setState] = useState<Record<string, boolean>>({});
  const db = supabase as unknown as { from: (t: string) => any };
  useEffect(() => { db.from('bruno_automations').select('key,enabled').then(({ data, error }: any) => {
    if (error) { toast.error('Impossibile leggere gli automatismi'); return; }
    setState(Object.fromEntries((data ?? []).map((r: any) => [r.key, r.enabled])));
  }); }, []);
  const toggle = async (key: string, enabled: boolean) => {
    const prev = state[key]; setState(s => ({ ...s, [key]: enabled }));
    const { data: u } = await supabase.auth.getUser();
    const { error } = await db.from('bruno_automations').update({ enabled, updated_at: new Date().toISOString(), updated_by: u.user?.id ?? null }).eq('key', key);
    if (error) { setState(s => ({ ...s, [key]: prev })); toast.error('Modifica non salvata'); } else toast.success(enabled ? 'Automatismo attivato' : 'Automatismo spento');
  };
  return <div className="space-y-4 p-4 md:p-6">
    <div><h2 className="text-xl font-semibold">Automatismi</h2><p className="text-sm text-muted-foreground">Cosa parte da solo, quando, e l’interruttore per fermarlo.</p></div>
    <div className="grid gap-3 lg:grid-cols-2">{BRUNO_AUTOMATIONS.map(a => { const on = a.toggle ? state[a.key] ?? true : a.status === 'always';
      return <section key={a.key} className="rounded-lg border bg-card p-4">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold">{a.title}</h3>
          <Badge variant={on ? 'default' : 'secondary'} className="mt-1">{a.status === 'missing' ? 'Da creare' : on ? 'Attivo' : 'Spento'}</Badge></div>
          {a.toggle && <Switch checked={on} onCheckedChange={v => toggle(a.key, v)} aria-label={`Attiva ${a.title}`} />}</div>
        <p className="mt-3 text-sm">{a.what}</p><p className="mt-1 text-xs text-muted-foreground">Quando: {a.when}</p>
        {a.status === 'always' && <p className="mt-1 text-xs text-muted-foreground">Sempre attivo: è la risposta alla richiesta del cliente.</p>}
      </section>; })}</div>
  </div>;
}
