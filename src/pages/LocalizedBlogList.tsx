import { useEffect } from 'react';
import type { BlogPost } from '@/hooks/useBlogPosts';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import BlogList from './BlogList';

interface Props {
  lang: string;
  initialPosts?: BlogPost[] | undefined;
}

const LocalizedBlogList = ({ lang, initialPosts }: Props) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang);
    }
  }, [lang, i18n]);

  return <BlogList lang={lang} initialPosts={initialPosts} />;
};

export default LocalizedBlogList;
