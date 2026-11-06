import { createFileRoute } from "@tanstack/react-router";
import LocalizedBurners from "@/pages/LocalizedBurners";

export const Route = createFileRoute("/en/burners")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedBurners lang="en" />;
}
