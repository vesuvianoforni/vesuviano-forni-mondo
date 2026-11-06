import { createFileRoute } from "@tanstack/react-router";
import LocalizedServices from "@/pages/LocalizedServices";

export const Route = createFileRoute("/en/services")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedServices lang="en" />;
}
