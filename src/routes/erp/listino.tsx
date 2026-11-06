import { createFileRoute } from "@tanstack/react-router";
import ERPListino from "@/pages/ERPListino";

export const Route = createFileRoute("/erp/listino")({
  component: ERPListino,
});
