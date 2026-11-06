import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/chi-siamo")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/qui-sommes-nous", statusCode: 301, replace: true });
  },
});
