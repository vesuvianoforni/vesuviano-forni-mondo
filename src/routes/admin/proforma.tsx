import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/proforma")({
  beforeLoad: () => {
    throw redirect({ to: "/erp/proforma", replace: true });
  },
});
