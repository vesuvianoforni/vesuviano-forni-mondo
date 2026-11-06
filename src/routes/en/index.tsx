import { createFileRoute } from "@tanstack/react-router";
import LocalizedIndex from "@/pages/LocalizedIndex";

export const Route = createFileRoute("/en/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedIndex lang="en" />;
}
