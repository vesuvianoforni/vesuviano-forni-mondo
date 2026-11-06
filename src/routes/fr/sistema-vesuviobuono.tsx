import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/sistema-vesuviobuono")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/systeme-vesuviobuono", statusCode: 301, replace: true });
  },
});
