import { createFileRoute } from "@tanstack/react-router";
import LanguageRedirect from "@/pages/LanguageRedirect";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Vesuviano Forni | Forni napoletani dall’Italia" },
    { name: "description", content: "Forni Vesuviano per pizzerie e uso domestico: scopri i modelli, le schede tecniche e il catalogo nella tua lingua." },
    { property: "og:title", content: "Vesuviano Forni" },
    { property: "og:description", content: "Forni napoletani Vesuviano: prodotti, cataloghi e consulenza nella tua lingua." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: LanguageRedirect,
});
