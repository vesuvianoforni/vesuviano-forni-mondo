import { createFileRoute } from "@tanstack/react-router";
import LocalizedSmokePurifier from "@/pages/LocalizedSmokePurifier";

export const Route = createFileRoute("/de/rauchfilter")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedSmokePurifier lang="de" />;
}
