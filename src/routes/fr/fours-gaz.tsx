import { createFileRoute } from "@tanstack/react-router";
import LocalizedGasOven from "@/pages/LocalizedGasOven";

export const Route = createFileRoute("/fr/fours-gaz")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedGasOven lang="fr" />;
}
