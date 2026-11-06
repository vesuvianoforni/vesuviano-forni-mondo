import { createFileRoute } from "@tanstack/react-router";
import LocalizedTraditionalOven from "@/pages/LocalizedTraditionalOven";

export const Route = createFileRoute("/es/hornos-tradicionales")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedTraditionalOven lang="es" />;
}
