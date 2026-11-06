import { createFileRoute } from "@tanstack/react-router";
import ERPMateriali from "@/pages/ERPMateriali";

export const Route = createFileRoute("/erp/materiali")({
  component: ERPMateriali,
});
