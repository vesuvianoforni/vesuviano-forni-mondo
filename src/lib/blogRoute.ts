import { notFound } from "@tanstack/react-router";
import { fetchPublishedBlogPost } from "@/hooks/useBlogPosts";

/**
 * Shared loader for /{lang}/blog/$slug: the article is fetched before render so
 * its text and metadata are in the initial HTML, and unknown slugs answer 404.
 * Draft previews (?preview=true) skip the check and load client-side.
 */
export async function loadBlogPostRoute(lang: string, slug: string, preview: boolean) {
  if (preview) return { post: null };
  const post = await fetchPublishedBlogPost(slug, lang);
  if (!post) throw notFound();
  return { post };
}
