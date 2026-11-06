import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/informazioni-utili")({
  beforeLoad: () => {
    throw redirect({ to: "/en/useful-information", statusCode: 301, replace: true });
  },
});
