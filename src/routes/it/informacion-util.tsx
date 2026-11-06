import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/informacion-util")({
  beforeLoad: () => {
    throw redirect({ to: "/it/informazioni-utili", statusCode: 301, replace: true });
  },
});
