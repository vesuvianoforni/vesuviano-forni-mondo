import SmokePurifierPage from './SmokePurifierPage';
import SEOHead from '@/components/SEOHead';

interface LocalizedSmokePurifierProps {
  lang: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const META: Record<string, { title: string; description: string }> = {
  it: { title: 'Depuratore Fumi SmokeZapper | Vesuviano', description: 'SmokeZapper: abbattimento fumi fino al 95% per forni a legna. Soluzione partner per pizzerie sostenibili.' },
  en: { title: 'SmokeZapper Smoke Purifier | Vesuviano', description: 'SmokeZapper: up to 95% wood-smoke abatement for pizza ovens. Partner solution for sustainable pizzerias.' },
  fr: { title: 'Purificateur de Fumée SmokeZapper | Vesuviano', description: 'SmokeZapper : réduction des fumées jusqu’à 95 % pour fours à bois. Solution partenaire pour pizzerias durables.' },
  de: { title: 'SmokeZapper Rauchreiniger | Vesuviano', description: 'SmokeZapper: bis zu 95 % Rauchreduktion für Holzöfen. Partnerlösung für nachhaltige Pizzerien.' },
  es: { title: 'Purificador de Humo SmokeZapper | Vesuviano', description: 'SmokeZapper: reducción de humo hasta 95% para hornos de leña. Solución partner para pizzerías sostenibles.' },
};

const LocalizedSmokePurifier = ({ lang }: LocalizedSmokePurifierProps) => {
  const meta = META[lang] || META.it;
  return (
    <>
      <SEOHead lang={lang} title={meta.title} description={meta.description} />
      <SmokePurifierPage lang={lang} />
    </>
  );
};

export default LocalizedSmokePurifier;
