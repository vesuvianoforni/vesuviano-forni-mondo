import { createFileRoute } from "@tanstack/react-router";
import ERPLeads from "@/pages/ERPLeads";

export const Route = createFileRoute("/erp/crm")({
  head: () => ({ meta: [
    { title: 'CRM clienti | Vesuviano ERP' },
    { name: 'description', content: 'Clienti, attività, comunicazioni e chiamate del team Vesuviano.' },
    { property: 'og:title', content: 'CRM clienti | Vesuviano ERP' },
    { property: 'og:description', content: 'Gestione clienti e chiamate con Bruno AI o operatore Vesuviano.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: ERPLeads,
});
