import { createFileRoute } from "@tanstack/react-router";
import LocalizedSmokePurifier from "@/pages/LocalizedSmokePurifier";

export const Route = createFileRoute("/es/purificador-humo")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedSmokePurifier lang="es" />;
}
