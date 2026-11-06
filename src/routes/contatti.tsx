import { createFileRoute } from "@tanstack/react-router";
import ContattiRedirect from "@/pages/ContattiRedirect";

export const Route = createFileRoute("/contatti")({
  component: ContattiRedirect,
});
