import { createFileRoute } from "@tanstack/react-router";
import BuiltOnPlace from "@/pages/BuiltOnPlace";

export const Route = createFileRoute("/built-on-place")({
  component: BuiltOnPlace,
});
