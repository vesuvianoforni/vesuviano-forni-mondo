import { createFileRoute } from "@tanstack/react-router";
import LocalizedRivestimenti from "@/pages/LocalizedRivestimenti";

export const Route = createFileRoute("/it/rivestimenti")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedRivestimenti lang="it" />;
}
