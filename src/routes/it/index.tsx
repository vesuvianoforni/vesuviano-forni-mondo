import { createFileRoute } from "@tanstack/react-router";
import LocalizedIndex from "@/pages/LocalizedIndex";

export const Route = createFileRoute("/it/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedIndex lang="it" />;
}
