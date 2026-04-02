import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import BlogPostPage from './BlogPost';

interface Props {
  lang: string;
}

const LocalizedBlogPost = ({ lang }: Props) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang);
    }
  }, [lang, i18n]);

  return <BlogPostPage lang={lang} />;
};

export default LocalizedBlogPost;
