import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/pronta-consegna")({
  beforeLoad: () => {
    throw redirect({ to: "/es/listo-para-enviar", statusCode: 301, replace: true });
  },
});
