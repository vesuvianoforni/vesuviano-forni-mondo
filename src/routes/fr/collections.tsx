import { createFileRoute } from "@tanstack/react-router";
import LocalizedCollections from "@/pages/LocalizedCollections";

export const Route = createFileRoute("/fr/collections")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedCollections lang="fr" />;
}
