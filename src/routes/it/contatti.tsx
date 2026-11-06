import { createFileRoute } from "@tanstack/react-router";
import LocalizedContact from "@/pages/LocalizedContact";

export const Route = createFileRoute("/it/contatti")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedContact lang="it" />;
}
