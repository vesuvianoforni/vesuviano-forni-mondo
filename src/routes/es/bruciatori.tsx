import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/bruciatori")({
  beforeLoad: () => {
    throw redirect({ to: "/es/quemadores", statusCode: 301, replace: true });
  },
});
