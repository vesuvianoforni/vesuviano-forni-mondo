import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/forni-elettrici")({
  beforeLoad: () => {
    throw redirect({ to: "/es/hornos-electricos", statusCode: 301, replace: true });
  },
});
