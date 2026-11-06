import { createFileRoute } from "@tanstack/react-router";
import LocalizedElectricOven from "@/pages/LocalizedElectricOven";

export const Route = createFileRoute("/es/hornos-electricos")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedElectricOven lang="es" />;
}
