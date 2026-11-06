import { createFileRoute } from "@tanstack/react-router";
import ERPMario from "@/pages/ERPMario";

export const Route = createFileRoute("/erp/mario")({
  component: ERPMario,
});
