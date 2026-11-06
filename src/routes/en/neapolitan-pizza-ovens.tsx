import { createFileRoute } from "@tanstack/react-router";
import LocalizedNeapolitanPizzaOvens from "@/pages/LocalizedNeapolitanPizzaOvens";

export const Route = createFileRoute("/en/neapolitan-pizza-ovens")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedNeapolitanPizzaOvens lang="en" />;
}
