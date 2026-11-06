import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/pronta-consegna")({
  beforeLoad: () => {
    throw redirect({ to: "/de/sofort-lieferbar", statusCode: 301, replace: true });
  },
});
