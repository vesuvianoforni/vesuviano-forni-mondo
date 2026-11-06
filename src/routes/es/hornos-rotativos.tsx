import { createFileRoute } from "@tanstack/react-router";
import LocalizedRotatingOven from "@/pages/LocalizedRotatingOven";

export const Route = createFileRoute("/es/hornos-rotativos")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedRotatingOven lang="es" />;
}
