import { createFileRoute } from "@tanstack/react-router";
import LocalizedRivestimenti from "@/pages/LocalizedRivestimenti";

export const Route = createFileRoute("/es/revestimientos")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedRivestimenti lang="es" />;
}
