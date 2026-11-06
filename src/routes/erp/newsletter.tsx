import { createFileRoute } from "@tanstack/react-router";
import ERPNewsletter from "@/pages/ERPNewsletter";

export const Route = createFileRoute("/erp/newsletter")({
  component: ERPNewsletter,
});
