import { createFileRoute } from "@tanstack/react-router";
import AdminBlog from "@/pages/AdminBlog";

export const Route = createFileRoute("/erp/blog")({
  component: AdminBlog,
});
