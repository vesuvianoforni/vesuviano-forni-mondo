import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';


const SUPPORTED_LANGS = ['it', 'en', 'fr', 'de', 'es'];

const detectBrowserLanguage = (): string => {
  const browserLangs = navigator.languages || [navigator.language];
  for (const bl of browserLangs) {
    const short = bl.split('-')[0].toLowerCase();
    if (SUPPORTED_LANGS.includes(short)) {
      return short;
    }
  }
  return 'it'; // fallback
};

const LanguageRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const lang = detectBrowserLanguage();
    navigate(`/${lang}`, { replace: true });
  }, [navigate]);

  return (

    <>
      <SEOHead title="Vesuviano Forni" description="Vesuviano - forni napoletani professionali." lang="it" canonical="/it" noIndex />
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vesuviano-500 mx-auto"></div>
        <p className="mt-4 text-stone-600">Loading...</p>
      </div>
    </div>
    </>
  );
};

export default LanguageRedirect;
