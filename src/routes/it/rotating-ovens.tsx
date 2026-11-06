import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/rotating-ovens")({
  beforeLoad: () => {
    throw redirect({ to: "/it/forni-rotanti", statusCode: 301, replace: true });
  },
});
