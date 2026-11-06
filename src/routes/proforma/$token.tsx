import { createFileRoute } from "@tanstack/react-router";
import ProformaPage from "@/pages/ProformaPage";

export const Route = createFileRoute("/proforma/$token")({
  component: ProformaPage,
});
