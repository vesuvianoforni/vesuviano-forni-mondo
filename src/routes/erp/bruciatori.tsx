import { createFileRoute } from "@tanstack/react-router";
import ERPBruciatori from "@/pages/ERPBruciatori";

export const Route = createFileRoute("/erp/bruciatori")({
  component: ERPBruciatori,
});
