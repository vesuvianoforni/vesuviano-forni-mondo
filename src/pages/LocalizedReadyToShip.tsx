import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import ReadyToShip from './ReadyToShip';

interface LocalizedReadyToShipProps {
  lang: string;
}

const LocalizedReadyToShip = ({ lang }: LocalizedReadyToShipProps) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang);
    }
  }, [lang, i18n]);

  return <ReadyToShip />;
};

export default LocalizedReadyToShip;
