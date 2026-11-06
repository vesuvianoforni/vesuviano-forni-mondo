import { createFileRoute } from "@tanstack/react-router";
import LocalizedContact from "@/pages/LocalizedContact";

export const Route = createFileRoute("/es/contacto")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedContact lang="es" />;
}
