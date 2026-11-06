import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/forni-tradizionali")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/fours-traditionnels", statusCode: 301, replace: true });
  },
});
