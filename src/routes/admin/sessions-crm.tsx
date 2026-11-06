import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/sessions-crm")({
  beforeLoad: () => {
    throw redirect({ to: "/erp/sessioni-configuratore", replace: true });
  },
});
