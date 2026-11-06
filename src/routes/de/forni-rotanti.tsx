import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/forni-rotanti")({
  beforeLoad: () => {
    throw redirect({ to: "/de/drehoefen", statusCode: 301, replace: true });
  },
});
