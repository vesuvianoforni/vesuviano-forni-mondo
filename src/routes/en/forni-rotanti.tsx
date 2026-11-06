import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/forni-rotanti")({
  beforeLoad: () => {
    throw redirect({ to: "/en/rotating-ovens", statusCode: 301, replace: true });
  },
});
