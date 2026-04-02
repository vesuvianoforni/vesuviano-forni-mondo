import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import Index from './Index';

interface LocalizedIndexProps {
  lang: string;
}

const LocalizedIndex = ({ lang }: LocalizedIndexProps) => {
  const { i18n } = useTranslation();
  const [ready, setReady] = useState(i18n.language === lang);

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang).then(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [lang, i18n]);

  if (!ready) return null;

  return <Index />;
};

export default LocalizedIndex;
