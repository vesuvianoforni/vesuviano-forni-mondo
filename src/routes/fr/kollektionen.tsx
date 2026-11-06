import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/kollektionen")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/collections", statusCode: 301, replace: true });
  },
});
