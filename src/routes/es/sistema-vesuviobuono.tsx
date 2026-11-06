import { createFileRoute } from "@tanstack/react-router";
import LocalizedVesuvioBuono from "@/pages/LocalizedVesuvioBuono";

export const Route = createFileRoute("/es/sistema-vesuviobuono")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedVesuvioBuono lang="es" />;
}
