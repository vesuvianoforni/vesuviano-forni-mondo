import { createFileRoute } from "@tanstack/react-router";
import LocalizedRotatingOven from "@/pages/LocalizedRotatingOven";

export const Route = createFileRoute("/en/rotating-ovens")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedRotatingOven lang="en" />;
}
