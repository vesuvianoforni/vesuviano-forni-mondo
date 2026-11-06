import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/depuratore-fumi")({
  beforeLoad: () => {
    throw redirect({ to: "/en/wood-smoke-purifier", statusCode: 301, replace: true });
  },
});
