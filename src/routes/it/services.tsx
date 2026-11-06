import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/services")({
  beforeLoad: () => {
    throw redirect({ to: "/it/servizi", statusCode: 301, replace: true });
  },
});
