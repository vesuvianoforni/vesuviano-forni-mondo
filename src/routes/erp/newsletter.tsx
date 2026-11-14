import { createFileRoute } from "@tanstack/react-router";
import ERPNewsletter from "@/pages/ERPNewsletter";

export const Route = createFileRoute("/erp/newsletter")({
  head: () => ({ meta: [
    { title: 'Newsletter food e pizzeria | Vesuviano ERP' },
    { name: 'description', content: 'Revisione delle quattro rubriche settimanali, calendario editoriale, fonti e versioni nelle lingue dei clienti.' },
    { property: 'og:title', content: 'Newsletter food e pizzeria | Vesuviano ERP' },
    { property: 'og:description', content: 'Bozze, fonti e traduzioni delle newsletter Vesuviano, con approvazione prima dell’invio.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: ERPNewsletter,
});
