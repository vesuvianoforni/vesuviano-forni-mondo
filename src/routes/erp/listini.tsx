import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/erp/listini")({
  beforeLoad: () => {
    throw redirect({ to: "/erp/listino", replace: true });
  },
});
