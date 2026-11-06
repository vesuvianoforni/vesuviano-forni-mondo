import { createFileRoute } from "@tanstack/react-router";
import LocalizedGasOven from "@/pages/LocalizedGasOven";

export const Route = createFileRoute("/de/gasoefen")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedGasOven lang="de" />;
}
