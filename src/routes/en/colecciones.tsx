import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/colecciones")({
  beforeLoad: () => {
    throw redirect({ to: "/en/collections", statusCode: 301, replace: true });
  },
});
