import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  slug_it: string;
  slug_en: string;
  slug_fr: string;
  slug_de: string;
  slug_es: string;
  title_it: string;
  title_en: string;
  title_fr: string;
  title_de: string;
  title_es: string;
  meta_description_it: string | null;
  meta_description_en: string | null;
  meta_description_fr: string | null;
  meta_description_de: string | null;
  meta_description_es: string | null;
  content_it: string;
  content_en: string;
  content_fr: string;
  content_de: string;
  content_es: string;
  featured_image: string | null;
  category: string;
  author: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

type LangKey = 'it' | 'en' | 'fr' | 'de' | 'es';

export const getLocalizedField = (post: BlogPost, field: string, lang: string): string => {
  const key = `${field}_${lang}` as keyof BlogPost;
  return (post[key] as string) || (post[`${field}_it` as keyof BlogPost] as string) || '';
};

export const getSlugField = (lang: string): `slug_${LangKey}` => {
  return `slug_${lang as LangKey}` as `slug_${LangKey}`;
};

/** All published posts, newest first. Used by blog list loaders for SSR. */
export const fetchPublishedBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data as BlogPost[]) ?? [];
};

export const useBlogPosts = (category?: string, initialPosts?: BlogPost[]) => {
  return useQuery({
    queryKey: ['blog-posts', category],
    ...(initialPosts && (!category || category === 'all') ? { initialData: initialPosts } : {}),
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BlogPost[];
    },
  });
};

/** Published post by localized slug, or null. Used by route loaders so the article is in the SSR HTML. */
export const fetchPublishedBlogPost = async (slug: string, lang: string): Promise<BlogPost | null> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq(getSlugField(lang), slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  return (data as BlogPost | null) ?? null;
};

export const useBlogPost = (slug: string, lang: string, preview = false, initialPost?: BlogPost | null) => {
  const slugField = getSlugField(lang);
  
  return useQuery({
    queryKey: ['blog-post', slug, lang, preview],
    ...(initialPost && !preview ? { initialData: initialPost } : {}),
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq(slugField, slug);

      if (!preview) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query.single();
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });
};
