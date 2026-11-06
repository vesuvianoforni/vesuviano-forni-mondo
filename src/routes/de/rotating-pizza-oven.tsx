import { createFileRoute } from "@tanstack/react-router";
import RotatingPizzaOven from "@/pages/RotatingPizzaOven";

export const Route = createFileRoute("/de/rotating-pizza-oven")({
  component: RotatingPizzaOven,
});
