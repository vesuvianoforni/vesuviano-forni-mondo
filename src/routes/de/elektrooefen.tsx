import { createFileRoute } from "@tanstack/react-router";
import LocalizedElectricOven from "@/pages/LocalizedElectricOven";

export const Route = createFileRoute("/de/elektrooefen")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedElectricOven lang="de" />;
}
