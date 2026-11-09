import { createFileRoute } from "@tanstack/react-router";
import ERPVettori from "@/pages/ERPVettori";

export const Route = createFileRoute("/erp/vettori")({
  head: () => ({ meta: [
    { title: "Vettori e aree servite | ERP Vesuviano" },
    { name: "description", content: "Vettori di trasporto Vesuviano, contatti e aree servite in Europa." },
    { property: "og:title", content: "Vettori e aree servite | ERP Vesuviano" },
    { property: "og:description", content: "Archivio vettori Vesuviano con più aree servite e contatti per destinazione." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: ERPVettori,
});
