import { createFileRoute } from "@tanstack/react-router";
import LocalizedBlogList from "@/pages/LocalizedBlogList";

export const Route = createFileRoute("/es/blog/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedBlogList lang="es" />;
}
