import { createFileRoute } from "@tanstack/react-router";
import LocalizedBurners from "@/pages/LocalizedBurners";

export const Route = createFileRoute("/de/brenner")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedBurners lang="de" />;
}
