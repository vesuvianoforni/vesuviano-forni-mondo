import { createFileRoute } from "@tanstack/react-router";
import Configurator from "@/pages/Configurator";

export const Route = createFileRoute("/configuratore/")({
  component: Configurator,
});
