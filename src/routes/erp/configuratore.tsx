import { createFileRoute } from "@tanstack/react-router";
import AdminConfigurator from "@/pages/AdminConfigurator";

export const Route = createFileRoute("/erp/configuratore")({
  component: AdminConfigurator,
});
