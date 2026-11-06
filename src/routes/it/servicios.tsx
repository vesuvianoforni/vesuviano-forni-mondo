import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/servicios")({
  beforeLoad: () => {
    throw redirect({ to: "/it/servizi", statusCode: 301, replace: true });
  },
});
