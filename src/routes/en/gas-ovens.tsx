import { createFileRoute } from "@tanstack/react-router";
import LocalizedGasOven from "@/pages/LocalizedGasOven";

export const Route = createFileRoute("/en/gas-ovens")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedGasOven lang="en" />;
}
