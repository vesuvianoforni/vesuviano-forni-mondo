import { createFileRoute } from "@tanstack/react-router";
import ThankYou from "@/pages/ThankYou";

export const Route = createFileRoute("/de/thank-you-de")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ThankYou lang="de" />;
}
