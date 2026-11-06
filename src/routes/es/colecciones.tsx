import { createFileRoute } from "@tanstack/react-router";
import LocalizedCollections from "@/pages/LocalizedCollections";

export const Route = createFileRoute("/es/colecciones")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedCollections lang="es" />;
}
