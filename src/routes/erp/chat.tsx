import { createFileRoute } from "@tanstack/react-router";
import ERPChat from "@/pages/ERPChat";

export const Route = createFileRoute("/erp/chat")({
  head: () => ({ meta: [
    { title: "Chat clienti | ERP Vesuviano" },
    { name: "description", content: "Tutte le conversazioni con i clienti: email, WhatsApp e chiamate, con invio messaggi." },
    { property: "og:title", content: "Chat clienti | ERP Vesuviano" },
    { property: "og:description", content: "Conversazioni CRM e invio messaggi ai clienti Vesuviano." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: ERPChat,
});
