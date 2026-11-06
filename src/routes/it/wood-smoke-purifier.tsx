import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/wood-smoke-purifier")({
  beforeLoad: () => {
    throw redirect({ to: "/it/depuratore-fumi", statusCode: 301, replace: true });
  },
});
