import { createFileRoute } from "@tanstack/react-router";
import ThankYou from "@/pages/ThankYou";

export const Route = createFileRoute("/it/thank-you-it")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ThankYou lang="it" />;
}
