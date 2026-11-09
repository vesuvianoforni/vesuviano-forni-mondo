import { createFileRoute } from "@tanstack/react-router";
import ERPChat from "@/pages/ERPChat";

export const Route = createFileRoute("/erp/chat")({
  head: () => ({ meta: [
    { title: "Chat clienti | ERP Vesuviano" },
    { name: "description", content: "Conversazioni WhatsApp Gennaro, Bruno IT e Bruno UK, chiamate e note dei clienti Vesuviano." },
    { property: "og:title", content: "Chat clienti | ERP Vesuviano" },
    { property: "og:description", content: "Conversazioni CRM e invio messaggi ai clienti Vesuviano." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: ERPChat,
});
