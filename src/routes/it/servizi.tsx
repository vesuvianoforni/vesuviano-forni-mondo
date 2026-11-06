import { createFileRoute } from "@tanstack/react-router";
import LocalizedServices from "@/pages/LocalizedServices";

export const Route = createFileRoute("/it/servizi")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedServices lang="it" />;
}
