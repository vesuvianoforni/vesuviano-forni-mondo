import { createFileRoute } from "@tanstack/react-router";
import LocalizedContact from "@/pages/LocalizedContact";

export const Route = createFileRoute("/en/contact")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedContact lang="en" />;
}
