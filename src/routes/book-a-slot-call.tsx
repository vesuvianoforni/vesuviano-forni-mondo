import { createFileRoute } from "@tanstack/react-router";
import BookAppointment from "@/pages/BookAppointment";

export const Route = createFileRoute("/book-a-slot-call")({
  component: BookAppointment,
});
