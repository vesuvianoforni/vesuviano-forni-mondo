import { createFileRoute } from '@tanstack/react-router';
import ERPMail from '@/pages/ERPMail';

export const Route = createFileRoute('/erp/mail')({
  head: () => ({ meta: [
    { title: 'Mail clienti | ERP Vesuviano' },
    { name: 'description', content: 'Posta email dei clienti Vesuviano: storico, composizione, firme e anteprima dalla casella aziendale.' },
    { property: 'og:title', content: 'Mail clienti | ERP Vesuviano' },
    { property: 'og:description', content: 'Leggi e invia email ai clienti dalla casella info@vesuvianoforni.com.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: ERPMail,
});