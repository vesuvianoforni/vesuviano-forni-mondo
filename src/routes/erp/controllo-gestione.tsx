import { createFileRoute } from "@tanstack/react-router";
import ERPControlloGestione from "@/pages/ERPControlloGestione";

export const Route = createFileRoute("/erp/controllo-gestione")({
  component: ERPControlloGestione,
});
