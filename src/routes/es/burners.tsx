import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/burners")({
  beforeLoad: () => {
    throw redirect({ to: "/es/quemadores", statusCode: 301, replace: true });
  },
});
