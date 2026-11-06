import { createFileRoute } from "@tanstack/react-router";
import ArchitettoAIRedirect from "@/pages/ArchitettoAIRedirect";

export const Route = createFileRoute("/architettoai")({
  component: ArchitettoAIRedirect,
});
