import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/sistema-vesuviobuono")({
  beforeLoad: () => {
    throw redirect({ to: "/en/vesuviobuono-system", statusCode: 301, replace: true });
  },
});
