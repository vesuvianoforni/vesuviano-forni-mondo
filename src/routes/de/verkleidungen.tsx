import { createFileRoute } from "@tanstack/react-router";
import LocalizedRivestimenti from "@/pages/LocalizedRivestimenti";

export const Route = createFileRoute("/de/verkleidungen")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedRivestimenti lang="de" />;
}
