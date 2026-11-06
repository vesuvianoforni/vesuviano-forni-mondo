import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/servizi")({
  beforeLoad: () => {
    throw redirect({ to: "/en/services", statusCode: 301, replace: true });
  },
});
