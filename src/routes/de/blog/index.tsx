import { createFileRoute } from "@tanstack/react-router";
import LocalizedBlogList from "@/pages/LocalizedBlogList";
import { fetchPublishedBlogPosts } from "@/hooks/useBlogPosts";

export const Route = createFileRoute("/de/blog/")({
  loader: async () => ({ posts: await fetchPublishedBlogPosts() }),
  component: RouteComponent,
});

function RouteComponent() {
  const { posts } = Route.useLoaderData();
  return <LocalizedBlogList lang="de" initialPosts={posts} />;
}
