import { createFileRoute } from "@tanstack/react-router";
import ERPForni from "@/pages/ERPForni";

export const Route = createFileRoute("/erp/forni")({
  component: ERPForni,
});
