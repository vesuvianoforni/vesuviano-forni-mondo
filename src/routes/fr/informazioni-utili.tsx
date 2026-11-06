import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fr/informazioni-utili")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/informations-utiles", statusCode: 301, replace: true });
  },
});
