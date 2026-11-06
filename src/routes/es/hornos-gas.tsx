import { createFileRoute } from "@tanstack/react-router";
import LocalizedGasOven from "@/pages/LocalizedGasOven";

export const Route = createFileRoute("/es/hornos-gas")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedGasOven lang="es" />;
}
