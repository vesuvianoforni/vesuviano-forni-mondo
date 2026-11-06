import { createFileRoute } from "@tanstack/react-router";
import LocalizedServices from "@/pages/LocalizedServices";

export const Route = createFileRoute("/de/dienstleistungen")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedServices lang="de" />;
}
