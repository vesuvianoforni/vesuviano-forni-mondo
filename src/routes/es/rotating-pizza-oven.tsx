import { createFileRoute } from "@tanstack/react-router";
import RotatingPizzaOven from "@/pages/RotatingPizzaOven";

export const Route = createFileRoute("/es/rotating-pizza-oven")({
  component: RotatingPizzaOven,
});
