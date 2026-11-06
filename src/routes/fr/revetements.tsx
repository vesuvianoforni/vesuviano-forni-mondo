import { createFileRoute } from "@tanstack/react-router";
import LocalizedRivestimenti from "@/pages/LocalizedRivestimenti";

export const Route = createFileRoute("/fr/revetements")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedRivestimenti lang="fr" />;
}
