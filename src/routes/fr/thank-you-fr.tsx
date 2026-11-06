import { createFileRoute } from "@tanstack/react-router";
import ThankYou from "@/pages/ThankYou";

export const Route = createFileRoute("/fr/thank-you-fr")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ThankYou lang="fr" />;
}
