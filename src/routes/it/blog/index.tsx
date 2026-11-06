import { createFileRoute } from "@tanstack/react-router";
import LocalizedBlogList from "@/pages/LocalizedBlogList";

export const Route = createFileRoute("/it/blog/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocalizedBlogList lang="it" />;
}
