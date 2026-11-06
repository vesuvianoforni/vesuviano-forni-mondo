import { createFileRoute } from "@tanstack/react-router";
import LocalizedArchitettoAI from "@/pages/LocalizedArchitettoAI";

export const Route = createFileRoute("/it/architettoai")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedArchitettoAI lang="it" />;
}
