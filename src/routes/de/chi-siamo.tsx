import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/chi-siamo")({
  beforeLoad: () => {
    throw redirect({ to: "/de/ueber-uns", statusCode: 301, replace: true });
  },
});
