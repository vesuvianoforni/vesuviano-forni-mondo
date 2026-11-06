import { createFileRoute } from "@tanstack/react-router";
import ERPProdotti from "@/pages/ERPProdotti";

export const Route = createFileRoute("/erp/prodotti")({
  component: ERPProdotti,
});
