import { createFileRoute } from "@tanstack/react-router";
import LocalizedBurners from "@/pages/LocalizedBurners";

export const Route = createFileRoute("/fr/bruleurs")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedBurners lang="fr" />;
}
