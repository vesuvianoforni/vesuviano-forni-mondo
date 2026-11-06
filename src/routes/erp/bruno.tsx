import { createFileRoute } from "@tanstack/react-router";
import ERPBruno from "@/pages/ERPBruno";

export const Route = createFileRoute("/erp/bruno")({
  component: ERPBruno,
});
