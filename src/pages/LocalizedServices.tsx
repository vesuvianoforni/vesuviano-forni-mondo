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

const LocalizedServices = ({ lang }: Props) => {
  const { i18n, t } = useTranslation();
  const [ready, setReady] = useState(i18n.language === lang);

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
      <SEOHead
        lang={lang}
        title={`${t('services.title', { defaultValue: 'Services' })} | Vesuviano Forni`}
        description={t('services.subtitle', { defaultValue: 'Technical consultation, 3D renders, international logistics and after-sales support for Vesuviano ovens.' })}
      />
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
