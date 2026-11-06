import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/about-us")({
  beforeLoad: () => {
    throw redirect({ to: "/it/chi-siamo", statusCode: 301, replace: true });
  },
});
