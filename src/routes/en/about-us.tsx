import { createFileRoute } from "@tanstack/react-router";
import LocalizedAboutUs from "@/pages/LocalizedAboutUs";

export const Route = createFileRoute("/en/about-us")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedAboutUs lang="en" />;
}
