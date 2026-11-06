import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/about-us")({
  beforeLoad: () => {
    throw redirect({ to: "/es/quienes-somos", statusCode: 301, replace: true });
  },
});
