import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/bruciatori")({
  beforeLoad: () => {
    throw redirect({ to: "/en/burners", statusCode: 301, replace: true });
  },
});
