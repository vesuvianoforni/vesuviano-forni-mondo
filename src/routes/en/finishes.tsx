import { createFileRoute } from "@tanstack/react-router";
import LocalizedRivestimenti from "@/pages/LocalizedRivestimenti";

export const Route = createFileRoute("/en/finishes")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedRivestimenti lang="en" />;
}
