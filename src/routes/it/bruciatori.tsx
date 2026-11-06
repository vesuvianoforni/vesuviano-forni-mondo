import { createFileRoute } from "@tanstack/react-router";
import LocalizedBurners from "@/pages/LocalizedBurners";

export const Route = createFileRoute("/it/bruciatori")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedBurners lang="it" />;
}
