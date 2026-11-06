import { createFileRoute } from "@tanstack/react-router";
import LocalizedCollections from "@/pages/LocalizedCollections";

export const Route = createFileRoute("/de/kollektionen")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedCollections lang="de" />;
}
