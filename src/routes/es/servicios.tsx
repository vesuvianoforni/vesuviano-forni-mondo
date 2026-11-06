import { createFileRoute } from "@tanstack/react-router";
import LocalizedServices from "@/pages/LocalizedServices";

export const Route = createFileRoute("/es/servicios")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedServices lang="es" />;
}
