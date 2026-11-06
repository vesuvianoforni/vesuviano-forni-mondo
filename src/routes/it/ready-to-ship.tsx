import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/ready-to-ship")({
  beforeLoad: () => {
    throw redirect({ to: "/it/pronta-consegna", statusCode: 301, replace: true });
  },
});
