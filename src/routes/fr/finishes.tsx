import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/finishes")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/revetements", statusCode: 301, replace: true });
  },
});
