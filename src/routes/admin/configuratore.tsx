import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/configuratore")({
  beforeLoad: () => {
    throw redirect({ to: "/erp/configuratore", replace: true });
  },
});
