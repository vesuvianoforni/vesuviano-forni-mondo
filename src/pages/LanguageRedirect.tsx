import { useEffect } from 'react';
import { useNavigate } from '@/lib/router-compat';
import SEOHead from '@/components/SEOHead';
import { selectBrowserLanguage } from '@/lib/browserLanguage';
import { getAlternatesForPath } from '@/lib/hreflang';
import LocalizedIndex from './LocalizedIndex';

const LanguageRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const preferences = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
    const lang = selectBrowserLanguage(preferences);
    navigate(`/${lang}`, { replace: true });
  }, [navigate]);

  return (
    <>
      <SEOHead
        title="Vesuviano | Forni Napoletani Professionali dal 1950"
        description="Forni napoletani artigianali dal 1950: a legna, gas, elettrici e VesuvioBuono zero emissioni. Per pizzerie e ristoranti nel mondo."
        lang="it"
        canonical="/"
        alternates={getAlternatesForPath('/it') ?? undefined}
      />
      <LocalizedIndex lang="it" />
    </>
  );
};

export default LanguageRedirect;
