import { createFileRoute } from "@tanstack/react-router";
import ElectricPizzaOven from "@/pages/ElectricPizzaOven";

export const Route = createFileRoute("/es/electric-pizza-oven")({
  component: ElectricPizzaOven,
});
