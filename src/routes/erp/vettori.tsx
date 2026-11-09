import { createFileRoute } from "@tanstack/react-router";
import ERPVettori from "@/pages/ERPVettori";

export const Route = createFileRoute("/erp/vettori")({
  component: ERPVettori,
});
