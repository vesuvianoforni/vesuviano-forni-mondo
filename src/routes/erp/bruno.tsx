import { createFileRoute } from "@tanstack/react-router";
import ERPBruno from "@/pages/ERPBruno";

export const Route = createFileRoute("/erp/bruno")({
  head: () => ({ meta: [
    { title: "Bruno · Comunicazioni e cabina operativa | Vesuviano ERP" },
    { name: "description", content: "Cabina operativa Bruno di Vesuviano: clienti, comunicazioni Email e WhatsApp, piani e chiamate." },
    { property: "og:title", content: "Bruno | Vesuviano ERP" },
    { property: "og:description", content: "Comunicazioni clienti e attività commerciali di Bruno, agente Vesuviano." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ERPBruno,
});
