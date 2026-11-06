import { createFileRoute } from "@tanstack/react-router";
import ERPLeads from "@/pages/ERPLeads";

export const Route = createFileRoute("/erp/crm")({
  component: ERPLeads,
});
