import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/forni-gas")({
  beforeLoad: () => {
    throw redirect({ to: "/de/gasoefen", statusCode: 301, replace: true });
  },
});
