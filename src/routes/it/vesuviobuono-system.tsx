import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/vesuviobuono-system")({
  beforeLoad: () => {
    throw redirect({ to: "/it/sistema-vesuviobuono", statusCode: 301, replace: true });
  },
});
