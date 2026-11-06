import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/rivestimenti")({
  beforeLoad: () => {
    throw redirect({ to: "/es/revestimientos", statusCode: 301, replace: true });
  },
});
