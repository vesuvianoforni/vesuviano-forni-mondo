import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/nuetzliche-informationen")({
  beforeLoad: () => {
    throw redirect({ to: "/it/informazioni-utili", statusCode: 301, replace: true });
  },
});
