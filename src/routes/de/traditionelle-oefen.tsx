import { createFileRoute } from "@tanstack/react-router";
import LocalizedTraditionalOven from "@/pages/LocalizedTraditionalOven";

export const Route = createFileRoute("/de/traditionelle-oefen")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedTraditionalOven lang="de" />;
}
