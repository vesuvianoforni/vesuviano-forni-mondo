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
  it: { title: 'Visualizza il tuo forno — Render 3D Forni Napoletani | Vesuviano Forni', description: 'Visualizza i forni Vesuviano in render 3D fotorealistici. Anastasia, Real Bosco, Sebastian: trova il modello perfetto per la tua pizzeria con una consulenza gratuita.' },
  en: { title: 'View Your Oven — 3D Neapolitan Oven Renders | Vesuviano Forni', description: 'View Vesuviano ovens in photorealistic 3D renders. Anastasia, Real Bosco, Sebastian: find the perfect model for your pizzeria with a free consultation.' },
  fr: { title: 'Visualisez votre four — Renders 3D Fours Napolitains | Vesuviano Forni', description: 'Visualisez les fours Vesuviano en renders 3D photoréalistes. Anastasia, Real Bosco, Sebastian : trouvez le modèle parfait pour votre pizzeria avec une consultation gratuite.' },
  de: { title: 'Visualisieren Sie Ihren Ofen — 3D Neapolitanische Ofen-Renderings | Vesuviano Forni', description: 'Visualisieren Sie Vesuviano-Öfen in fotorealistischen 3D-Renderings. Anastasia, Real Bosco, Sebastian: Finden Sie das perfekte Modell für Ihre Pizzeria mit einer kostenlosen Beratung.' },
  es: { title: 'Visualiza tu horno — Renders 3D Hornos Napolitanos | Vesuviano Forni', description: 'Visualiza los hornos Vesuviano en renders 3D fotorrealistas. Anastasia, Real Bosco, Sebastian: encuentra el modelo perfecto para tu pizzería con una consulta gratuita.' },
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
