import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ArchitettoAI from './ArchitettoAI';

interface LocalizedArchitettoAIProps {
  lang: string;
}

const LocalizedArchitettoAI = ({ lang }: LocalizedArchitettoAIProps) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <ArchitettoAI />;
};

export default LocalizedArchitettoAI;
