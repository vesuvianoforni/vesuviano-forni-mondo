import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/erp/listino-rivenditori")({
  beforeLoad: () => {
    throw redirect({ to: "/erp/listino", replace: true });
  },
});
