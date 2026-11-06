import { createFileRoute } from "@tanstack/react-router";
import LocalizedNeapolitanPizzaOvens from "@/pages/LocalizedNeapolitanPizzaOvens";

export const Route = createFileRoute("/de/neapolitanische-pizzaoefen")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedNeapolitanPizzaOvens lang="de" />;
}
