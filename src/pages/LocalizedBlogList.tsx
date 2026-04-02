import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import BlogList from './BlogList';

interface Props {
  lang: string;
}

const LocalizedBlogList = ({ lang }: Props) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang);
    }
  }, [lang, i18n]);

  return <BlogList lang={lang} />;
};

export default LocalizedBlogList;
