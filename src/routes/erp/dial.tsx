import { createFileRoute } from "@tanstack/react-router";
import ERPDial from "@/pages/ERPDial";

export const Route = createFileRoute("/erp/dial")({
  head: () => ({ meta: [
    { title: "Dial chiamate CRM | ERP Vesuviano" },
    { name: "description", content: "Selezione rapida dei clienti CRM e avvio chiamate con Bruno AI o dirette." },
    { property: "og:title", content: "Dial chiamate CRM | ERP Vesuviano" },
    { property: "og:description", content: "Interfaccia mobile per chiamare i clienti del CRM Vesuviano." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: ERPDial,
});
