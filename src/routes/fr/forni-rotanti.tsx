import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/forni-rotanti")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/fours-rotatifs", statusCode: 301, replace: true });
  },
});
