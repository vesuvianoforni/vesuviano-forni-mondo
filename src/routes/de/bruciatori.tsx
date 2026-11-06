import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/bruciatori")({
  beforeLoad: () => {
    throw redirect({ to: "/de/brenner", statusCode: 301, replace: true });
  },
});
