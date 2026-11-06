import { createFileRoute } from "@tanstack/react-router";
import LocalizedNeapolitanPizzaOvens from "@/pages/LocalizedNeapolitanPizzaOvens";

export const Route = createFileRoute("/es/hornos-pizza-napolitana")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedNeapolitanPizzaOvens lang="es" />;
}
