import { createFileRoute } from "@tanstack/react-router";
import LocalizedReadyToShip from "@/pages/LocalizedReadyToShip";

export const Route = createFileRoute("/es/listo-para-enviar")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedReadyToShip lang="es" />;
}
