import { createFileRoute } from "@tanstack/react-router";
import PublicContractTerms from "@/pages/PublicContractTerms";

export const Route = createFileRoute("/contratto/$token/termini")({
  component: PublicContractTerms,
});
