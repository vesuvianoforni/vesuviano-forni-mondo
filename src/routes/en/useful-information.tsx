import { createFileRoute } from "@tanstack/react-router";
import LocalizedUsefulInfo from "@/pages/LocalizedUsefulInfo";

export const Route = createFileRoute("/en/useful-information")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedUsefulInfo lang="en" />;
}
