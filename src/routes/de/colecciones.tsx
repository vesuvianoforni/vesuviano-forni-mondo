import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/colecciones")({
  beforeLoad: () => {
    throw redirect({ to: "/de/kollektionen", statusCode: 301, replace: true });
  },
});
