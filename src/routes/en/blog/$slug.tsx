import { createFileRoute } from "@tanstack/react-router";
import LocalizedBlogPost from "@/pages/LocalizedBlogPost";
import { loadBlogPostRoute } from "@/lib/blogRoute";

export const Route = createFileRoute("/en/blog/$slug")({
  loaderDeps: ({ search }) => ({ preview: (search as Record<string, unknown>)["preview"] === "true" || (search as Record<string, unknown>)["preview"] === true }),
  loader: ({ params, deps }) => loadBlogPostRoute("en", params.slug, deps.preview),
  component: RouteComponent,
});

function RouteComponent() {
  const { post } = Route.useLoaderData();
  return <LocalizedBlogPost lang="en" initialPost={post} />;
}
