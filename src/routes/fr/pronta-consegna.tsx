import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/pronta-consegna")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/pret-a-expedier", statusCode: 301, replace: true });
  },
});
