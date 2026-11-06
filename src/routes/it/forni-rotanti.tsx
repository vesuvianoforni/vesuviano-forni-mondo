import { createFileRoute } from "@tanstack/react-router";
import LocalizedRotatingOven from "@/pages/LocalizedRotatingOven";

export const Route = createFileRoute("/it/forni-rotanti")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedRotatingOven lang="it" />;
}
