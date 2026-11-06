import { createFileRoute } from "@tanstack/react-router";
import LocalizedAboutUs from "@/pages/LocalizedAboutUs";

export const Route = createFileRoute("/fr/qui-sommes-nous")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedAboutUs lang="fr" />;
}
