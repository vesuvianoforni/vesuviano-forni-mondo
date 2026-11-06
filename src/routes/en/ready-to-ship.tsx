import { createFileRoute } from "@tanstack/react-router";
import LocalizedReadyToShip from "@/pages/LocalizedReadyToShip";

export const Route = createFileRoute("/en/ready-to-ship")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedReadyToShip lang="en" />;
}
