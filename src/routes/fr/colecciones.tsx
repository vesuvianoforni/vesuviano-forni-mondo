import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/colecciones")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/collections", statusCode: 301, replace: true });
  },
});
