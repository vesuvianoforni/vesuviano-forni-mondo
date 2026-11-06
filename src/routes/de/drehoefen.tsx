import { createFileRoute } from "@tanstack/react-router";
import LocalizedRotatingOven from "@/pages/LocalizedRotatingOven";

export const Route = createFileRoute("/de/drehoefen")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedRotatingOven lang="de" />;
}
