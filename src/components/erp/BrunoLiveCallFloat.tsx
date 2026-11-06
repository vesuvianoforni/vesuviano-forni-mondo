import { useEffect, useState } from 'react';
import { Link } from '@/lib/router-compat';
import { ChevronDown, ChevronUp, PhoneIncoming, PhoneOutgoing, UserPlus, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BrunoLiveCall } from './BrunoLiveCall';
import type { VoiceCall } from '@/lib/brunoVoice';

type FloatLead = { contact_name: string | null; company_name: string | null; city: string | null; country: string | null; status: string | null; source: string | null; created_at: string };
type FloatCall = VoiceCall & { leads: FloatLead | null };

/** A lead is "new" when Bruno's call created it, or it was added shortly before the call. */
export function isNewLead(call: { created_at: string; leads: { source: string | null; created_at: string } | null }) {
  if (!call.leads) return true;
  if (call.leads.source === 'telefono_bruno') return true;
  return new Date(call.created_at).getTime() - new Date(call.leads.created_at).getTime() < 10 * 60_000;
}

export function BrunoLiveCallFloat() {
  const [calls, setCalls] = useState<FloatCall[]>([]), [open, setOpen] = useState(true);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data } = await supabase.from('bruno_voice_calls')
        .select('*, leads!bruno_voice_calls_lead_id_fkey(contact_name,company_name,city,country,status,source,created_at)')
        .in('status', ['dialing', 'active']).order('created_at', { ascending: false }).limit(3);
      if (alive && data) setCalls(data as unknown as FloatCall[]);
    };
    void load();
    const t = window.setInterval(() => { if (!document.hidden) void load(); }, 4000);
    return () => { alive = false; window.clearInterval(t); };
  }, []);
  if (!calls.length) return null;
  return <div className="fixed bottom-4 right-4 z-50 w-[min(26rem,calc(100vw-2rem))] space-y-3">
    {calls.map(c => {
      const fresh = isNewLead(c), inbound = c.direction === 'inbound';
      const name = c.leads?.contact_name || c.leads?.company_name || c.destination;
      return <div key={c.id} className="rounded-xl border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start gap-3 p-3 border-b">
          <div className="mt-1">{inbound ? <PhoneIncoming className="h-5 w-5 text-primary" /> : <PhoneOutgoing className="h-5 w-5 text-primary" />}</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Bruno sta parlando con · {inbound ? 'in entrata' : 'in uscita'}</p>
            <p className="font-semibold truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{[c.destination, c.leads?.city, c.leads?.country].filter(Boolean).join(' · ')}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant={fresh ? 'default' : 'secondary'} className="gap-1">{fresh ? <UserPlus className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}{fresh ? 'Nuovo lead' : 'Già in CRM'}</Badge>
              {c.lead_id && <Link to={`/erp/crm?lead=${c.lead_id}`} className="text-xs underline text-primary">Apri scheda</Link>}
            </div>
          </div>
          <Button size="icon" variant="ghost" aria-label={open ? 'Riduci' : 'Espandi'} onClick={() => setOpen(o => !o)}>{open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</Button>
        </div>
        {open && <div className="p-2"><BrunoLiveCall call={c} onEnded={() => setCalls(cs => cs.filter(x => x.id !== c.id))} /></div>}
      </div>;
    })}
  </div>;
}
