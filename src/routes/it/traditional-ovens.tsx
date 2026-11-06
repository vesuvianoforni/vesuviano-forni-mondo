import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/traditional-ovens")({
  beforeLoad: () => {
    throw redirect({ to: "/it/forni-tradizionali", statusCode: 301, replace: true });
  },
});
