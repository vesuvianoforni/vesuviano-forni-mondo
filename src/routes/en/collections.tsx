import { createFileRoute } from "@tanstack/react-router";
import LocalizedCollections from "@/pages/LocalizedCollections";

export const Route = createFileRoute("/en/collections")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedCollections lang="en" />;
}
