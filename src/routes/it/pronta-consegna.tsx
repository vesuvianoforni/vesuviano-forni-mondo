import { createFileRoute } from "@tanstack/react-router";
import LocalizedReadyToShip from "@/pages/LocalizedReadyToShip";

export const Route = createFileRoute("/it/pronta-consegna")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedReadyToShip lang="it" />;
}
