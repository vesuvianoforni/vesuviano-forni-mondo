import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import ZapperSection from '@/components/ZapperSection';
import ConsultationForm from '@/components/ConsultationForm';
import AIChatWidget from '@/components/chat/AIChatWidget';
import SEOHead from '@/components/SEOHead';

interface SmokePurifierPageProps {
  lang: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const SmokePurifierPage = ({ lang }: SmokePurifierPageProps) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang);
    }
  }, [lang, i18n]);

  return (

    <>
      <SEOHead title="Abbattitore Fumi SmokeZapper | Vesuviano" description="Sistema SmokeZapper per abbattere il 95% dei fumi dei forni a legna." lang="it" />
      <div className="min-h-screen bg-stone-900">
      <Header />
      <main className="pt-16">
        <ZapperSection />
        <section id="consultation" aria-label="Consultation form">
          <ConsultationForm />
        </section>
      </main>
      <AIChatWidget />
    </div>
    </>
  );
};

export default SmokePurifierPage;
