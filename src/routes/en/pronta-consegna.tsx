import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/pronta-consegna")({
  beforeLoad: () => {
    throw redirect({ to: "/en/ready-to-ship", statusCode: 301, replace: true });
  },
});
