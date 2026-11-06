import { createFileRoute } from "@tanstack/react-router";
import LocalizedElectricOven from "@/pages/LocalizedElectricOven";

export const Route = createFileRoute("/en/electric-ovens")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedElectricOven lang="en" />;
}
