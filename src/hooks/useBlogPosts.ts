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

export const useBlogPosts = (category?: string) => {
  return useQuery({
    queryKey: ['blog-posts', category],
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

export const useBlogPost = (slug: string, lang: string) => {
  const slugField = getSlugField(lang);
  
  return useQuery({
    queryKey: ['blog-post', slug, lang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq(slugField, slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });
};
