import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import Index from './Index';
import RouteSEO from '@/components/RouteSEO';

interface LocalizedIndexProps {
  lang: string;
}

const TITLES: Record<string, { title: string; description: string }> = {
  it: {
    title: 'Vesuviano | Forni Napoletani Professionali dal 1950',
    description: 'Forni napoletani artigianali dal 1950: a legna, gas, elettrici e VesuvioBuono zero emissioni. Per pizzerie e ristoranti nel mondo.',
  },
  en: {
    title: 'Vesuviano | Professional Neapolitan Ovens Since 1950',
    description: 'Handcrafted Neapolitan ovens since 1950: wood, gas, electric and zero-emission VesuvioBuono. For pizzerias and restaurants worldwide.',
  },
  fr: {
    title: 'Vesuviano | Fours Napolitains Professionnels depuis 1950',
    description: 'Fours napolitains artisanaux depuis 1950 : à bois, gaz, électriques et VesuvioBuono zéro émission. Pour pizzerias et restaurants du monde.',
  },
  de: {
    title: 'Vesuviano | Professionelle Neapolitanische Öfen seit 1950',
    description: 'Handgefertigte neapolitanische Öfen seit 1950: Holz, Gas, Elektro und VesuvioBuono mit Null-Emissionen. Für Pizzerien und Restaurants weltweit.',
  },
  es: {
    title: 'Vesuviano | Hornos Napolitanos Profesionales desde 1950',
    description: 'Hornos napolitanos artesanales desde 1950: leña, gas, eléctricos y VesuvioBuono cero emisiones. Para pizzerías y restaurantes del mundo.',
  },
};

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

  const meta = TITLES[lang] || TITLES.it;
  return (
    <>
      <RouteSEO title={meta.title} description={meta.description} lang={lang} />
      <Index />
    </>
  );
};

export default LocalizedIndex;
