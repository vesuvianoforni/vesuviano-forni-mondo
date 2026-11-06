import { createFileRoute } from "@tanstack/react-router";
import ERPKnowledgeBase from "@/pages/ERPKnowledgeBase";

export const Route = createFileRoute("/erp/knowledge-base")({
  component: ERPKnowledgeBase,
});
