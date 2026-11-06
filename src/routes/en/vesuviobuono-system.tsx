import { createFileRoute } from "@tanstack/react-router";
import LocalizedVesuvioBuono from "@/pages/LocalizedVesuvioBuono";

export const Route = createFileRoute("/en/vesuviobuono-system")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedVesuvioBuono lang="en" />;
}
