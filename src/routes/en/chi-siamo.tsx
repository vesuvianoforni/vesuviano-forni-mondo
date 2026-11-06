import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/chi-siamo")({
  beforeLoad: () => {
    throw redirect({ to: "/en/about-us", statusCode: 301, replace: true });
  },
});
