import { createFileRoute } from "@tanstack/react-router";
import LocalizedElectricOven from "@/pages/LocalizedElectricOven";

export const Route = createFileRoute("/fr/fours-electriques")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedElectricOven lang="fr" />;
}
