import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReadyToShip from './ReadyToShip';

interface LocalizedReadyToShipProps {
  lang: string;
}

const LocalizedReadyToShip = ({ lang }: LocalizedReadyToShipProps) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <ReadyToShip />;
};

export default LocalizedReadyToShip;
