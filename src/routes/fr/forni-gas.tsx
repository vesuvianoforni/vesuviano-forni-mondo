import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/forni-gas")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/fours-gaz", statusCode: 301, replace: true });
  },
});
