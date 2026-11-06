import { createFileRoute } from "@tanstack/react-router";
import LocalizedUsefulInfo from "@/pages/LocalizedUsefulInfo";

export const Route = createFileRoute("/it/informazioni-utili")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedUsefulInfo lang="it" />;
}
