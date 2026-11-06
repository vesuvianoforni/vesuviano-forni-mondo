import { createFileRoute } from "@tanstack/react-router";
import LocalizedBlogList from "@/pages/LocalizedBlogList";
import { fetchPublishedBlogPosts } from "@/hooks/useBlogPosts";

export const Route = createFileRoute("/es/blog/")({
  loader: async () => ({ posts: await fetchPublishedBlogPosts() }),
  component: RouteComponent,
});

function RouteComponent() {
  const { posts } = Route.useLoaderData();
  return <LocalizedBlogList lang="es" initialPosts={posts} />;
}
