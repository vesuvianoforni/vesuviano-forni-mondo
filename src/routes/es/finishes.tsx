import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/finishes")({
  beforeLoad: () => {
    throw redirect({ to: "/es/revestimientos", statusCode: 301, replace: true });
  },
});
