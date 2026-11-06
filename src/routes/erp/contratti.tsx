import { createFileRoute } from "@tanstack/react-router";
import ERPContratti from "@/pages/ERPContratti";

export const Route = createFileRoute("/erp/contratti")({
  component: ERPContratti,
});
