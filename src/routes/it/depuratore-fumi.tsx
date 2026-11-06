import { createFileRoute } from "@tanstack/react-router";
import LocalizedSmokePurifier from "@/pages/LocalizedSmokePurifier";

export const Route = createFileRoute("/it/depuratore-fumi")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedSmokePurifier lang="it" />;
}
