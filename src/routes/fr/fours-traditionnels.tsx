import { createFileRoute } from "@tanstack/react-router";
import LocalizedTraditionalOven from "@/pages/LocalizedTraditionalOven";

export const Route = createFileRoute("/fr/fours-traditionnels")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedTraditionalOven lang="fr" />;
}
