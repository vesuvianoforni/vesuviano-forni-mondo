import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/finishes")({
  beforeLoad: () => {
    throw redirect({ to: "/it/rivestimenti", statusCode: 301, replace: true });
  },
});
