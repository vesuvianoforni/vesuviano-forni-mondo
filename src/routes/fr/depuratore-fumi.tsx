import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/depuratore-fumi")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/purificateur-fumee", statusCode: 301, replace: true });
  },
});
