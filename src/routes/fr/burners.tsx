import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/burners")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/bruleurs", statusCode: 301, replace: true });
  },
});
