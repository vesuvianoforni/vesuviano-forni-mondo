import { createFileRoute } from "@tanstack/react-router";
import LocalizedReadyToShip from "@/pages/LocalizedReadyToShip";

export const Route = createFileRoute("/fr/pret-a-expedier")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedReadyToShip lang="fr" />;
}
