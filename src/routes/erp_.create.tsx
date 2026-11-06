import { createFileRoute } from "@tanstack/react-router";
import CreateAdmin from "@/pages/CreateAdmin";

export const Route = createFileRoute("/erp_/create")({
  component: CreateAdmin,
});
