import { createFileRoute } from "@tanstack/react-router";
import SessionsCRM from "@/pages/SessionsCRM";

export const Route = createFileRoute("/erp/sessioni-configuratore")({
  component: SessionsCRM,
});
