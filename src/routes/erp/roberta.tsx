import { createFileRoute } from "@tanstack/react-router";
import ERPRoberta from "@/pages/ERPRoberta";

export const Route = createFileRoute("/erp/roberta")({
  component: ERPRoberta,
});
