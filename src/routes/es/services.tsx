import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/services")({
  beforeLoad: () => {
    throw redirect({ to: "/es/servicios", statusCode: 301, replace: true });
  },
});
