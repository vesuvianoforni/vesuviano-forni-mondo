import { useEffect, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import Services from '@/components/Services';

const PreFooterSimpleForm = lazy(() => import('@/components/PreFooterSimpleForm'));

interface Props {
  lang: string;
}

const META: Record<string, { title: string; description: string }> = {
  it: { title: 'Servizi — Consulenza, Render 3D e Logistica | Vesuviano Forni', description: 'Servizi Vesuviano: consulenza tecnica, render 3D personalizzati, logistica internazionale e assistenza post-vendita per il tuo progetto di forno napoletano.' },
  en: { title: 'Services — Consultancy, 3D Renders & Logistics | Vesuviano Forni', description: 'Vesuviano services: technical consultancy, custom 3D renders, international logistics and after-sales support for your Neapolitan oven project.' },
  fr: { title: 'Services — Conseil, Rendus 3D et Logistique | Vesuviano Forni', description: 'Services Vesuviano : conseil technique, rendus 3D personnalisés, logistique internationale et SAV pour votre projet de four napolitain.' },
  de: { title: 'Dienstleistungen — Beratung, 3D-Renderings & Logistik | Vesuviano Forni', description: 'Vesuviano-Services: technische Beratung, individuelle 3D-Renderings, internationale Logistik und After-Sales-Support für Ihren neapolitanischen Ofen.' },
  es: { title: 'Servicios — Consultoría, Renders 3D y Logística | Vesuviano Forni', description: 'Servicios Vesuviano: consultoría técnica, renders 3D personalizados, logística internacional y postventa para tu proyecto de horno napolitano.' },
};

const LocalizedServices = ({ lang }: Props) => {
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
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <Header />
      <SEOHead lang={lang} title={meta.title} description={meta.description} />
      <main className="pt-20">
        <Services />
        <Suspense fallback={null}>
          <PreFooterSimpleForm />
        </Suspense>
      </main>
    </div>
  );
};

export default LocalizedServices;
