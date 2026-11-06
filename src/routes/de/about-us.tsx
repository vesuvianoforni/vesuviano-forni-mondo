import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/about-us")({
  beforeLoad: () => {
    throw redirect({ to: "/de/ueber-uns", statusCode: 301, replace: true });
  },
});
