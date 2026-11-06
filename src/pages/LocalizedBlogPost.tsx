import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import BlogPostPage from './BlogPost';
import type { BlogPost } from '@/hooks/useBlogPosts';

interface Props {
  lang: string;
  initialPost?: BlogPost | null | undefined;
}

const LocalizedBlogPost = ({ lang, initialPost }: Props) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang);
    }
  }, [lang, i18n]);

  return <BlogPostPage lang={lang} initialPost={initialPost} />;
};

export default LocalizedBlogPost;
