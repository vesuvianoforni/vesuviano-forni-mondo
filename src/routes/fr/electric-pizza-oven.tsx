import { createFileRoute } from "@tanstack/react-router";
import ElectricPizzaOven from "@/pages/ElectricPizzaOven";

export const Route = createFileRoute("/fr/electric-pizza-oven")({
  component: ElectricPizzaOven,
});
