import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/about-us")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/qui-sommes-nous", statusCode: 301, replace: true });
  },
});
