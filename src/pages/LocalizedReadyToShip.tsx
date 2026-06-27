import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import ReadyToShip from './ReadyToShip';
import SEOHead from '@/components/SEOHead';

interface LocalizedReadyToShipProps {
  lang: string;
}

const META: Record<string, { title: string; description: string }> = {
  it: { title: 'Forni Pronta Consegna | Vesuviano', description: 'Forni napoletani disponibili in pronta consegna con spedizione inclusa. Modelli unici, prezzi promozionali.' },
  en: { title: 'Ready to Ship Ovens | Vesuviano', description: 'Neapolitan ovens ready to ship with worldwide delivery included. Unique models, promotional pricing.' },
  fr: { title: 'Fours Prêts à Expédier | Vesuviano', description: 'Fours napolitains prêts à expédier avec livraison incluse. Modèles uniques, prix promotionnels.' },
  de: { title: 'Versandfertige Öfen | Vesuviano', description: 'Neapolitanische Öfen sofort lieferbar inkl. Versand. Einzelstücke zu Aktionspreisen.' },
  es: { title: 'Hornos Listos para Enviar | Vesuviano', description: 'Hornos napolitanos listos para enviar con envío incluido. Modelos únicos, precios promocionales.' },
};

const LocalizedReadyToShip = ({ lang }: LocalizedReadyToShipProps) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang);
    }
  }, [lang, i18n]);

  const meta = META[lang] || META.it;
  return (
    <>
      <SEOHead lang={lang} title={meta.title} description={meta.description} />
      <ReadyToShip />
    </>
  );
};

export default LocalizedReadyToShip;
