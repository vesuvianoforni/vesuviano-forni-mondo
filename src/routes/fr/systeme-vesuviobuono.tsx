import { createFileRoute } from "@tanstack/react-router";
import LocalizedVesuvioBuono from "@/pages/LocalizedVesuvioBuono";

export const Route = createFileRoute("/fr/systeme-vesuviobuono")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedVesuvioBuono lang="fr" />;
}
