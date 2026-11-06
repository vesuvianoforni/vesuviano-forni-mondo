import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/purificador-humo")({
  beforeLoad: () => {
    throw redirect({ to: "/it/depuratore-fumi", statusCode: 301, replace: true });
  },
});
