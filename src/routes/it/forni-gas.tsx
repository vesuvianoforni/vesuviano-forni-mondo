import { createFileRoute } from "@tanstack/react-router";
import LocalizedGasOven from "@/pages/LocalizedGasOven";

export const Route = createFileRoute("/it/forni-gas")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedGasOven lang="it" />;
}
