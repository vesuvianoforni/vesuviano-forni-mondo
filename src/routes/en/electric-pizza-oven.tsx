import { createFileRoute } from "@tanstack/react-router";
import ElectricPizzaOven from "@/pages/ElectricPizzaOven";

export const Route = createFileRoute("/en/electric-pizza-oven")({
  component: ElectricPizzaOven,
});
