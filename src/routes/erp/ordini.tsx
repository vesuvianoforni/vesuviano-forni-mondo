import { createFileRoute } from "@tanstack/react-router";
import ERPOrdini from "@/pages/ERPOrdini";

export const Route = createFileRoute("/erp/ordini")({
  component: ERPOrdini,
});
