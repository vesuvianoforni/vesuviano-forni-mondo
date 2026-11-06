import { createFileRoute } from "@tanstack/react-router";
import LocalizedContact from "@/pages/LocalizedContact";

export const Route = createFileRoute("/fr/contact")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedContact lang="fr" />;
}
