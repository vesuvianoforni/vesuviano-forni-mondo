import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/rivestimenti")({
  beforeLoad: () => {
    throw redirect({ to: "/en/finishes", statusCode: 301, replace: true });
  },
});
