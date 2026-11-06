import { createFileRoute } from "@tanstack/react-router";
import LocalizedReadyToShip from "@/pages/LocalizedReadyToShip";

export const Route = createFileRoute("/de/sofort-lieferbar")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedReadyToShip lang="de" />;
}
