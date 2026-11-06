import { createFileRoute } from "@tanstack/react-router";
import LocalizedServices from "@/pages/LocalizedServices";

export const Route = createFileRoute("/fr/services")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedServices lang="fr" />;
}
