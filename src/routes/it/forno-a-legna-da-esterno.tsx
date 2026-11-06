import { createFileRoute } from "@tanstack/react-router";
import ForniLegnaEsterno from "@/pages/ForniLegnaEsterno";

export const Route = createFileRoute("/it/forno-a-legna-da-esterno")({
  component: ForniLegnaEsterno,
});
