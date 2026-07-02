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
  it: { title: 'Modelli — Forni Napoletani Artigianali | Vesuviano Forni', description: 'Scopri tutti i modelli di forni napoletani Vesuviano: Anastasia, Real Bosco, Sebastian. Trova il forno perfetto per la tua pizzeria con una consulenza gratuita.' },
  en: { title: 'Models — Handcrafted Neapolitan Ovens | Vesuviano Forni', description: 'Discover all Vesuviano Neapolitan oven models: Anastasia, Real Bosco, Sebastian. Find the perfect oven for your pizzeria with a free consultation.' },
  fr: { title: 'Modèles — Fours Napolitains Artisanaux | Vesuviano Forni', description: 'Découvrez tous les modèles de fours napolitains Vesuviano : Anastasia, Real Bosco, Sebastian. Trouvez le four parfait pour votre pizzeria avec une consultation gratuite.' },
  de: { title: 'Modelle — Handgefertigte Neapolitanische Öfen | Vesuviano Forni', description: 'Entdecken Sie alle Vesuviano neapolitanischen Ofenmodelle: Anastasia, Real Bosco, Sebastian. Finden Sie den perfekten Ofen für Ihre Pizzeria mit einer kostenlosen Beratung.' },
  es: { title: 'Modelos — Hornos Napolitanos Artesanales | Vesuviano Forni', description: 'Descubre todos los modelos de hornos napolitanos Vesuviano: Anastasia, Real Bosco, Sebastian. Encuentra el horno perfecto para tu pizzería con una consulta gratuita.' },
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
