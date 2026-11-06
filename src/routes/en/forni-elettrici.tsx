import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/forni-elettrici")({
  beforeLoad: () => {
    throw redirect({ to: "/en/electric-ovens", statusCode: 301, replace: true });
  },
});
