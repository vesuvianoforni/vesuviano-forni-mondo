import { createFileRoute } from "@tanstack/react-router";
import AdminProforma from "@/pages/AdminProforma";

export const Route = createFileRoute("/erp/proforma")({
  component: AdminProforma,
});
