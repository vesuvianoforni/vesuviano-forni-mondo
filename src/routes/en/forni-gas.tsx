import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/forni-gas")({
  beforeLoad: () => {
    throw redirect({ to: "/en/gas-ovens", statusCode: 301, replace: true });
  },
});
