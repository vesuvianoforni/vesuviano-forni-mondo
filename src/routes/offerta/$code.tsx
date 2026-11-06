import { createFileRoute } from "@tanstack/react-router";
import PublicCommercialOffer from "@/pages/PublicCommercialOffer";

export const Route = createFileRoute("/offerta/$code")({
  component: PublicCommercialOffer,
});
