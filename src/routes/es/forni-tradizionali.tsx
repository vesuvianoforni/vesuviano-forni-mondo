import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/forni-tradizionali")({
  beforeLoad: () => {
    throw redirect({ to: "/es/hornos-tradicionales", statusCode: 301, replace: true });
  },
});
