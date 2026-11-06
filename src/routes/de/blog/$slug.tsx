import { createFileRoute } from "@tanstack/react-router";
import LocalizedBlogPost from "@/pages/LocalizedBlogPost";
import { loadBlogPostRoute } from "@/lib/blogRoute";

export const Route = createFileRoute("/de/blog/$slug")({
  loaderDeps: ({ search }) => ({ preview: (search as Record<string, unknown>)["preview"] === "true" || (search as Record<string, unknown>)["preview"] === true }),
  loader: ({ params, deps }) => loadBlogPostRoute("de", params.slug, deps.preview),
  component: RouteComponent,
});

function RouteComponent() {
  const { post } = Route.useLoaderData();
  return <LocalizedBlogPost lang="de" initialPost={post} />;
}
