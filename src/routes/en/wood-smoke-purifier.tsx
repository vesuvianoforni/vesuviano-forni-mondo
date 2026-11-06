import { createFileRoute } from "@tanstack/react-router";
import LocalizedSmokePurifier from "@/pages/LocalizedSmokePurifier";

export const Route = createFileRoute("/en/wood-smoke-purifier")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedSmokePurifier lang="en" />;
}
