import { createFileRoute } from "@tanstack/react-router";
import LocalizedArchitettoAI from "@/pages/LocalizedArchitettoAI";

export const Route = createFileRoute("/fr/architettoai")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedArchitettoAI lang="fr" />;
}
