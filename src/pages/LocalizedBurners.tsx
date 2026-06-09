import BurnersPage from './BurnersPage';
import RouteSEO from '@/components/RouteSEO';

interface LocalizedBurnersProps {
  lang: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const META: Record<string, { title: string; description: string }> = {
  it: { title: 'Bruciatori per Forni a Gas | Vesuviano', description: 'Bruciatori professionali per forni a gas: catalogo completo serie A, B e C per pizzerie e ristoranti.' },
  en: { title: 'Gas Oven Burners | Vesuviano', description: 'Professional gas oven burners: full catalog of A, B and C series for pizzerias and restaurants.' },
  fr: { title: 'Brûleurs pour Fours à Gaz | Vesuviano', description: 'Brûleurs professionnels pour fours à gaz : catalogue complet séries A, B et C.' },
  de: { title: 'Brenner für Gasöfen | Vesuviano', description: 'Professionelle Brenner für Gasöfen: kompletter Katalog Serien A, B und C.' },
  es: { title: 'Quemadores para Hornos a Gas | Vesuviano', description: 'Quemadores profesionales para hornos a gas: catálogo completo series A, B y C.' },
};

const LocalizedBurners = ({ lang }: LocalizedBurnersProps) => {
  const meta = META[lang] || META.it;
  return (
    <>
      <RouteSEO lang={lang} title={meta.title} description={meta.description} />
      <BurnersPage lang={lang} />
    </>
  );
};

export default LocalizedBurners;
