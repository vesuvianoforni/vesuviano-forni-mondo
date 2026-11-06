import { createFileRoute } from "@tanstack/react-router";
import LocalizedBlogPost from "@/pages/LocalizedBlogPost";

export const Route = createFileRoute("/es/blog/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedBlogPost lang="es" />;
}
