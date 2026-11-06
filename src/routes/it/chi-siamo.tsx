import { createFileRoute } from "@tanstack/react-router";
import LocalizedAboutUs from "@/pages/LocalizedAboutUs";

export const Route = createFileRoute("/it/chi-siamo")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedAboutUs lang="it" />;
}
