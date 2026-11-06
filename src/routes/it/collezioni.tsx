import { createFileRoute } from "@tanstack/react-router";
import LocalizedCollections from "@/pages/LocalizedCollections";

export const Route = createFileRoute("/it/collezioni")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedCollections lang="it" />;
}
