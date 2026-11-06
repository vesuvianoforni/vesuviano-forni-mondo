import { createFileRoute } from "@tanstack/react-router";
import ERPChatLogs from "@/pages/ERPChatLogs";

export const Route = createFileRoute("/erp/chat-logs")({
  component: ERPChatLogs,
});
