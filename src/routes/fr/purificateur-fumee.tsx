import { createFileRoute } from "@tanstack/react-router";
import LocalizedSmokePurifier from "@/pages/LocalizedSmokePurifier";

export const Route = createFileRoute("/fr/purificateur-fumee")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedSmokePurifier lang="fr" />;
}
