import { Megaphone, Mail, Share2, Target, CalendarClock, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEOHead from '@/components/SEOHead';
import ERPNewsletter from './ERPNewsletter';

const pillars = [
  {
    icon: Mail,
    title: 'Email marketing',
    desc: 'Ogni 15 giorni (1° e 16 del mese, ore 9:00) Roberta prepara una bozza di newsletter scegliendo tema, foto reali dal sito e lingua. Nulla parte senza la vostra approvazione.',
    status: 'Attivo',
  },
  {
    icon: Share2,
    title: 'Post social',
    desc: 'Prossimamente: bozze di post per i canali social Vesuviano, con foto dei forni e copy in lingua.',
    status: 'In arrivo',
  },
  {
    icon: Target,
    title: 'Campagne Meta / Ads',
    desc: 'Prossimamente: suggerimenti di copy e creatività per le campagne, usando i video commerciali caricati nell’ERP.',
    status: 'In arrivo',
  },
];

export default function ERPRoberta() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <SEOHead title="Roberta AI | ERP" description="Marketing Manager AI" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" /> Roberta AI
          </h1>
          <p className="text-sm text-muted-foreground">Marketing Manager · email marketing, post social, campagne Meta / Ads</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary" className="gap-1"><CalendarClock className="h-3 w-3" /> Bozza automatica ogni 15 giorni</Badge>
          <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" /> Invio solo dopo approvazione</Badge>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {pillars.map((p) => (
          <Card key={p.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between gap-2">
                <span className="flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" />{p.title}</span>
                <Badge variant={p.status === 'Attivo' ? 'default' : 'outline'}>{p.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{p.desc}</p></CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Campagne newsletter</h2>
        <ERPNewsletter embedded />
      </div>
    </div>
  );
}
