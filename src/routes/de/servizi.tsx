import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/servizi")({
  beforeLoad: () => {
    throw redirect({ to: "/de/dienstleistungen", statusCode: 301, replace: true });
  },
});
