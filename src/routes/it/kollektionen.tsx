import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/kollektionen")({
  beforeLoad: () => {
    throw redirect({ to: "/it/collezioni", statusCode: 301, replace: true });
  },
});
