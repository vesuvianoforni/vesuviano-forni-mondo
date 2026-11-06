import { createFileRoute } from "@tanstack/react-router";
import LocalizedTraditionalOven from "@/pages/LocalizedTraditionalOven";

export const Route = createFileRoute("/en/traditional-ovens")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedTraditionalOven lang="en" />;
}
