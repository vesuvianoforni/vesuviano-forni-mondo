import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/create")({
  beforeLoad: () => {
    throw redirect({ to: "/erp/create", replace: true });
  },
});
