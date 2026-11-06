import { createFileRoute } from "@tanstack/react-router";
import LocalizedElectricOven from "@/pages/LocalizedElectricOven";

export const Route = createFileRoute("/it/forni-elettrici")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedElectricOven lang="it" />;
}
