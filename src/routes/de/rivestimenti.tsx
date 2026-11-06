import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/rivestimenti")({
  beforeLoad: () => {
    throw redirect({ to: "/de/verkleidungen", statusCode: 301, replace: true });
  },
});
