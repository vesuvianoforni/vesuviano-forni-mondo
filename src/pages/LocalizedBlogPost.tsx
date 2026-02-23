import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BlogPostPage from './BlogPost';

interface Props {
  lang: string;
}

const LocalizedBlogPost = ({ lang }: Props) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <BlogPostPage lang={lang} />;
};

export default LocalizedBlogPost;
