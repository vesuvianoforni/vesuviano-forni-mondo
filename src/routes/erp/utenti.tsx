import { createFileRoute } from "@tanstack/react-router";
import ERPUtenti from "@/pages/ERPUtenti";

export const Route = createFileRoute("/erp/utenti")({
  component: ERPUtenti,
});
