import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/informazioni-utili")({
  beforeLoad: () => {
    throw redirect({ to: "/de/nuetzliche-informationen", statusCode: 301, replace: true });
  },
});
