import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/erp/leads")({
  beforeLoad: () => {
    throw redirect({ to: "/erp/crm", replace: true });
  },
});
