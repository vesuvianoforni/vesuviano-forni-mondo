import { useEffect, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import OvenDataInitializer from '@/components/OvenDataInitializer';

const OvenGallery = lazy(() => import('@/components/OvenGallery'));
const PreFooterSimpleForm = lazy(() => import('@/components/PreFooterSimpleForm'));

interface Props {
  lang: string;
}

const LocalizedCollections = ({ lang }: Props) => {
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

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <OvenDataInitializer />
      <Header />
      <main className="pt-20">
        <Suspense fallback={null}>
          <OvenGallery />
        </Suspense>
        <Suspense fallback={null}>
          <PreFooterSimpleForm />
        </Suspense>
      </main>
    </div>
  );
};

export default LocalizedCollections;
