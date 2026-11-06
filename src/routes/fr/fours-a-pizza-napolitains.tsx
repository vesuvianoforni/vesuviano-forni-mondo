import { createFileRoute } from "@tanstack/react-router";
import LocalizedNeapolitanPizzaOvens from "@/pages/LocalizedNeapolitanPizzaOvens";

export const Route = createFileRoute("/fr/fours-a-pizza-napolitains")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedNeapolitanPizzaOvens lang="fr" />;
}
