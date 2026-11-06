import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/sistema-vesuviobuono")({
  beforeLoad: () => {
    throw redirect({ to: "/de/vesuviobuono-system", statusCode: 301, replace: true });
  },
});
