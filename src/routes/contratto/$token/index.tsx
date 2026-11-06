import { createFileRoute } from "@tanstack/react-router";
import PublicContractSign from "@/pages/PublicContractSign";

export const Route = createFileRoute("/contratto/$token/")({
  component: PublicContractSign,
});
