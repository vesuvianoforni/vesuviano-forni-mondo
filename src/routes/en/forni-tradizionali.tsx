import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/forni-tradizionali")({
  beforeLoad: () => {
    throw redirect({ to: "/en/traditional-ovens", statusCode: 301, replace: true });
  },
});
