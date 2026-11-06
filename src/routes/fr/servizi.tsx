import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/servizi")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/services", statusCode: 301, replace: true });
  },
});
