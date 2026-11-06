import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/forni-gas")({
  beforeLoad: () => {
    throw redirect({ to: "/es/hornos-gas", statusCode: 301, replace: true });
  },
});
