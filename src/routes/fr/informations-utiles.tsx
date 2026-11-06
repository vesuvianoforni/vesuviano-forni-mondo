import { createFileRoute } from "@tanstack/react-router";
import LocalizedUsefulInfo from "@/pages/LocalizedUsefulInfo";

export const Route = createFileRoute("/fr/informations-utiles")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedUsefulInfo lang="fr" />;
}
