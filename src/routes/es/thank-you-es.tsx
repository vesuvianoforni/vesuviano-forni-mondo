import { createFileRoute } from "@tanstack/react-router";
import ThankYou from "@/pages/ThankYou";

export const Route = createFileRoute("/es/thank-you-es")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ThankYou lang="es" />;
}
