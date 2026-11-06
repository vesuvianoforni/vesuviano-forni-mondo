import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/collezioni")({
  beforeLoad: () => {
    throw redirect({ to: "/es/colecciones", statusCode: 301, replace: true });
  },
});
