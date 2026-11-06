import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/catalogo/en")({
  beforeLoad: () => {
    throw redirect({ href: "/catalogo/vesuviano-catalogue-en.pdf", replace: true });
  },
});
