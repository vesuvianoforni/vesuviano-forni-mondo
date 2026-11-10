import { createFileRoute } from "@tanstack/react-router";
import ERPDial from "@/pages/ERPDial";

export const Route = createFileRoute("/erp/dial")({
  head: () => ({ meta: [
    { title: "Dial chiamate CRM | ERP Vesuviano" },
    { name: "description", content: "Chiamate CRM con Bruno AI o operatore e storico delle chiamate ricevute e inoltrate al numero aziendale." },
    { property: "og:title", content: "Dial chiamate CRM | ERP Vesuviano" },
    { property: "og:description", content: "Dial Vesuviano: clienti, chiamate in uscita, ricevute e inoltri al numero aziendale." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: ERPDial,
});
