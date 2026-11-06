import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/burners")({
  beforeLoad: () => {
    throw redirect({ to: "/it/bruciatori", statusCode: 301, replace: true });
  },
});
