import { createFileRoute } from "@tanstack/react-router";
import ERPProntaConsegna from "@/pages/ERPProntaConsegna";

export const Route = createFileRoute("/erp/pronta-consegna")({
  component: ERPProntaConsegna,
});
