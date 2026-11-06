import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/forni-rotanti")({
  beforeLoad: () => {
    throw redirect({ to: "/es/hornos-rotativos", statusCode: 301, replace: true });
  },
});
