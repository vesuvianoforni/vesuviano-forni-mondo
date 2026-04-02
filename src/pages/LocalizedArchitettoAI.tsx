import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import ArchitettoAI from './ArchitettoAI';

interface LocalizedArchitettoAIProps {
  lang: string;
}

const LocalizedArchitettoAI = ({ lang }: LocalizedArchitettoAIProps) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang);
    }
  }, [lang, i18n]);

  return <ArchitettoAI />;
};

export default LocalizedArchitettoAI;
