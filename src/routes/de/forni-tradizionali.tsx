import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/forni-tradizionali")({
  beforeLoad: () => {
    throw redirect({ to: "/de/traditionelle-oefen", statusCode: 301, replace: true });
  },
});
