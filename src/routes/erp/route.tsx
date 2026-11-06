import { createFileRoute } from "@tanstack/react-router";
import ERPLayout from "@/pages/ERPLayout";

export const Route = createFileRoute("/erp")({
  component: ERPLayout,
});
