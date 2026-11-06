import { createFileRoute } from "@tanstack/react-router";
import ConfiguratorWithToken from "@/pages/ConfiguratorWithToken";

export const Route = createFileRoute("/configuratore/$token")({
  component: ConfiguratorWithToken,
});
