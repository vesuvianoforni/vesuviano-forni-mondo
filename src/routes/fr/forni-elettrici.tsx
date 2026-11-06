import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/forni-elettrici")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/fours-electriques", statusCode: 301, replace: true });
  },
});
