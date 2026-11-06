import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/informazioni-utili")({
  beforeLoad: () => {
    throw redirect({ to: "/es/informacion-util", statusCode: 301, replace: true });
  },
});
