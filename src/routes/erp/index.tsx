import { createFileRoute } from "@tanstack/react-router";
import ERPDashboard from "@/pages/ERPDashboard";

export const Route = createFileRoute("/erp/")({
  component: ERPDashboard,
});
