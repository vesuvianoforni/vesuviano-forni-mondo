import { createFileRoute } from "@tanstack/react-router";
import ERPOfferte from "@/pages/ERPOfferte";

export const Route = createFileRoute("/erp/offerte")({
  component: ERPOfferte,
});
