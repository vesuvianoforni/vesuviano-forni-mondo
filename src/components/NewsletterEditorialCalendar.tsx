import { useEffect, useState } from 'react';
import { Wheat, Cpu, Users, ChefHat, CalendarDays } from 'lucide-react';
import { editorialCalendar } from '@/lib/newsletterThemes';

const icons = { ingredients: Wheat, technology: Cpu, management: Users, trends: ChefHat };

export default function NewsletterEditorialCalendar() {
  const [schedule, setSchedule] = useState<ReturnType<typeof editorialCalendar>>([]);
  useEffect(() => { setSchedule(editorialCalendar(new Date())); }, []);
  return (
    <section aria-label="Calendario editoriale" className="border-y py-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><CalendarDays className="h-4 w-4 text-primary" />Calendario editoriale</h2>
      <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {schedule.map(({ date, theme }, index) => {
          const Icon = icons[theme.id];
          return <li key={date} className="flex min-w-0 items-start gap-2.5">
            <Icon className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{new Date(`${date}T12:00:00Z`).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })}{index === 0 ? ' · Prossima / in corso' : ''}</p>
              <p className="mt-1 break-words text-sm font-semibold">{theme.labels.it}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{theme.description}</p>
            </div>
          </li>;
        })}
      </ol>
    </section>
  );
}