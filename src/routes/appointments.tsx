import { createFileRoute } from "@tanstack/react-router";
import Appointments from "@/pages/Appointments";

export const Route = createFileRoute("/appointments")({
  component: Appointments,
});
