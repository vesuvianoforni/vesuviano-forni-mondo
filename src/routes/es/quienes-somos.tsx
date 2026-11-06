import { createFileRoute } from "@tanstack/react-router";
import LocalizedAboutUs from "@/pages/LocalizedAboutUs";

export const Route = createFileRoute("/es/quienes-somos")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedAboutUs lang="es" />;
}
