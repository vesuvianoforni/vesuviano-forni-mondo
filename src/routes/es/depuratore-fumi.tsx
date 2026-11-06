import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/depuratore-fumi")({
  beforeLoad: () => {
    throw redirect({ to: "/es/purificador-humo", statusCode: 301, replace: true });
  },
});
