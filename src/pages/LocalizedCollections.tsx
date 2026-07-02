import { useEffect, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import OvenDataInitializer from '@/components/OvenDataInitializer';

const ImmersiveOvenGallery = lazy(() => import('@/components/ImmersiveOvenGallery'));

interface Props {
  lang: string;
}

const META: Record<string, { title: string; description: string }> = {
  it: { title: 'Collezioni Forni Napoletani — Anastasia, Ottavio, Real Bosco | Vesuviano Forni', description: 'Collezioni Vesuviano: scopri Anastasia, Ottavio, Real Bosco, Sebastian, VesuvioBuono e Forno Rotante. Modelli, rivestimenti e specifiche tecniche.' },
  en: { title: 'Neapolitan Oven Collections — Anastasia, Ottavio, Real Bosco | Vesuviano Forni', description: 'Vesuviano collections: discover Anastasia, Ottavio, Real Bosco, Sebastian, VesuvioBuono and Rotating ovens — models, finishes and full technical specs.' },
  fr: { title: 'Collections de Fours Napolitains — Anastasia, Ottavio, Real Bosco | Vesuviano Forni', description: 'Collections Vesuviano : découvrez Anastasia, Ottavio, Real Bosco, Sebastian, VesuvioBuono et le four rotatif — modèles, revêtements et fiches techniques.' },
  de: { title: 'Neapolitanische Ofen-Kollektionen — Anastasia, Ottavio, Real Bosco | Vesuviano Forni', description: 'Vesuviano-Kollektionen: Anastasia, Ottavio, Real Bosco, Sebastian, VesuvioBuono und Drehofen — Modelle, Verkleidungen und technische Daten.' },
  es: { title: 'Colecciones de Hornos Napolitanos — Anastasia, Ottavio, Real Bosco | Vesuviano Forni', description: 'Colecciones Vesuviano: descubre Anastasia, Ottavio, Real Bosco, Sebastian, VesuvioBuono y el horno rotativo — modelos, acabados y fichas técnicas.' },
};

const LocalizedCollections = ({ lang }: Props) => {
  const { i18n, t } = useTranslation();
  const [ready, setReady] = useState(i18n.language === lang);
  const meta = META[lang] || META.it;

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang).then(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [lang, i18n]);

  if (!ready) return null;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0c0c0c]">
      <OvenDataInitializer />
      <Header />
      <SEOHead lang={lang} title={meta.title} description={meta.description} />
      <main className="pt-20">
        <Suspense fallback={null}>
          <ImmersiveOvenGallery />
        </Suspense>
      </main>
    </div>
  );
};

export default LocalizedCollections;
