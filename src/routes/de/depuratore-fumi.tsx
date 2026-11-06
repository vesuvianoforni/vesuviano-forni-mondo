import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/depuratore-fumi")({
  beforeLoad: () => {
    throw redirect({ to: "/de/rauchfilter", statusCode: 301, replace: true });
  },
});
