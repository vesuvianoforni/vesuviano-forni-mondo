import { createFileRoute } from "@tanstack/react-router";
import LocalizedContact from "@/pages/LocalizedContact";

export const Route = createFileRoute("/de/kontakt")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedContact lang="de" />;
}
