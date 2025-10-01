import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Index from './Index';

interface LocalizedIndexProps {
  lang: string;
}

const LocalizedIndex = ({ lang }: LocalizedIndexProps) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <Index />;
};

export default LocalizedIndex;
