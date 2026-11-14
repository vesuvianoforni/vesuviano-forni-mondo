import { createFileRoute } from "@tanstack/react-router";
import ERPRoberta from "@/pages/ERPRoberta";

export const Route = createFileRoute("/erp/roberta")({
  head: () => ({ meta: [
    { title: 'Roberta AI — Marketing | Vesuviano ERP' },
    { name: 'description', content: 'Newsletter settimanali food e pizzeria, campagne e bozze multilingua da approvare con Roberta AI.' },
    { property: 'og:title', content: 'Roberta AI — Marketing | Vesuviano ERP' },
    { property: 'og:description', content: 'Notizie di settore e campagne multilingua curate da Roberta AI.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: ERPRoberta,
});
