import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/gas-ovens")({
  beforeLoad: () => {
    throw redirect({ to: "/it/forni-gas", statusCode: 301, replace: true });
  },
});
