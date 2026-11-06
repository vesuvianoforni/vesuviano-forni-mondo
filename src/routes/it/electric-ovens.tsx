import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/electric-ovens")({
  beforeLoad: () => {
    throw redirect({ to: "/it/forni-elettrici", statusCode: 301, replace: true });
  },
});
