import { createFileRoute } from "@tanstack/react-router";
import ThankYou from "@/pages/ThankYou";

export const Route = createFileRoute("/en/thank-you-en")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ThankYou lang="en" />;
}
