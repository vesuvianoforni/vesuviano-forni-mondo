import { createFileRoute } from "@tanstack/react-router";
import LocalizedRotatingOven from "@/pages/LocalizedRotatingOven";

export const Route = createFileRoute("/fr/fours-rotatifs")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedRotatingOven lang="fr" />;
}
