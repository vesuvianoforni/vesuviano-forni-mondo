import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/forni-elettrici")({
  beforeLoad: () => {
    throw redirect({ to: "/de/elektrooefen", statusCode: 301, replace: true });
  },
});
