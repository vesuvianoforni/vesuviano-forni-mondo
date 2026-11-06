import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/it/revetements")({
  beforeLoad: () => {
    throw redirect({ to: "/it/rivestimenti", statusCode: 301, replace: true });
  },
});
