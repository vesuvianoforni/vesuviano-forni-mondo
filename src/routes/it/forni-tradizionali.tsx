import { createFileRoute } from "@tanstack/react-router";
import LocalizedTraditionalOven from "@/pages/LocalizedTraditionalOven";

export const Route = createFileRoute("/it/forni-tradizionali")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedTraditionalOven lang="it" />;
}
