import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import ConsultationForm from '@/components/ConsultationForm';
import RivestimentiCompact from '@/components/RivestimentiCompact';
import { Button } from '@/components/ui/button';
import CtaButton from '@/components/CtaButton';
import { Card, CardContent } from '@/components/ui/card';

interface LocalizedTraditionalOvenProps {
  lang: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const META: Record<string, { title: string; description: string }> = {
  it: { title: 'Forni a Legna Tradizionali Napoletani | Vesuviano Forni', description: "Forni a legna tradizionali napoletani: cottura autentica a 450°C, cupola in mattoni refrattari e camera unica per la vera pizza verace. Per pizzerie e ristoranti." },
  en: { title: 'Traditional Wood-Fired Neapolitan Ovens | Vesuviano Forni', description: 'Traditional Neapolitan wood-fired ovens: authentic 450°C baking, refractory brick dome and single chamber for true Neapolitan pizza. Built for restaurants worldwide.' },
  fr: { title: 'Fours à Bois Napolitains Traditionnels | Vesuviano Forni', description: "Fours à bois napolitains traditionnels : cuisson authentique à 450°C, voûte en briques réfractaires et chambre unique pour la vraie pizza napolitaine." },
  de: { title: 'Traditionelle Neapolitanische Holzöfen | Vesuviano Forni', description: 'Traditionelle neapolitanische Holzöfen: authentisches Backen bei 450°C, Kuppel aus Schamottsteinen und Einkammersystem für echte neapolitanische Pizza.' },
  es: { title: 'Hornos de Leña Tradicionales Napolitanos | Vesuviano Forni', description: 'Hornos de leña tradicionales napolitanos: cocción auténtica a 450°C, cúpula en ladrillos refractarios y cámara única para verdadera pizza napolitana.' },
};

const LocalizedTraditionalOven = ({ lang }: LocalizedTraditionalOvenProps) => {
  const { i18n, t } = useTranslation();
  const meta = META[lang] || META.it;

  useEffect(() => {
    loadLanguage(lang);
    document.documentElement.lang = lang;
    document.title = `${t('products.traditional.title')} - Vesuviano`;
  }, [lang, i18n, t]);

  return (
    <div className="min-h-screen bg-white">
        <Header />
        <SEOHead lang={lang} title={meta.title} description={meta.description} />
        
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
          <img 
            src="/lovable-uploads/vesuviobuono-verde-mosaico.webp"
            alt={t('products.traditional.title')}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
          <div className="relative h-full container mx-auto px-6 flex items-center">
            <div className="max-w-3xl text-white">
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {t('products.traditional.title')}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                {t('products.traditional.subtitle')}
              </p>
              <CtaButton dark className="px-8 py-6 text-lg" />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 mb-20">
              <div>
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-6">
                  {t('ovenDetails.traditional.aboutTitle')}
                </h2>
                <p className="text-lg text-stone-600 leading-relaxed mb-6">
                  {t('ovenDetails.traditional.aboutText1')}
                </p>
                <p className="text-lg text-stone-600 leading-relaxed">
                  {t('ovenDetails.traditional.aboutText2')}
                </p>
              </div>
              <div className="space-y-6">
                <img 
                  src="/lovable-uploads/vesuviobuono-forno-legna.webp"
                  alt={t('products.traditional.title')}
                  className="w-full h-80 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Technical Features */}
            <div className="mb-20">
              <h3 className="font-playfair text-3xl font-bold text-charcoal-900 mb-8 text-center">
                {t('ovenDetails.traditional.featuresTitle')}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.keys(t('products.traditional.features', { returnObjects: true }) as object).map((featureKey) => (
                  <Card key={featureKey} className="border-stone-200 hover:border-vesuviano-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-vesuviano-100 rounded-full flex items-center justify-center mb-4">
                        <div className="w-6 h-6 bg-vesuviano-500 rounded-full"></div>
                      </div>
                      <h4 className="font-inter font-semibold text-charcoal-900 mb-2">
                        {t(`products.traditional.features.${featureKey}`)}
                      </h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-stone-50 rounded-2xl p-8 mb-20">
              <h3 className="font-playfair text-3xl font-bold text-charcoal-900 mb-8">
                {t('ovenDetails.traditional.specsTitle')}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.keys(t('ovenDetails.traditional.specs', { returnObjects: true }) as object).map((specKey) => (
                  <div key={specKey} className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-vesuviano-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-charcoal-900">{t(`ovenDetails.traditional.specs.${specKey}.label`)}:</strong>{' '}
                      <span className="text-stone-600">{t(`ovenDetails.traditional.specs.${specKey}.value`)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications */}
            <div className="text-center mb-20">
              <h3 className="font-playfair text-3xl font-bold text-charcoal-900 mb-6">
                {t('ovenDetails.traditional.applicationsTitle')}
              </h3>
              <p className="text-lg text-stone-600 max-w-3xl mx-auto mb-8">
                {t('ovenDetails.traditional.applicationsText')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {(t('ovenDetails.traditional.applications', { returnObjects: true }) as string[]).map((app, index) => (
                  <div key={index} className="bg-vesuviano-50 text-vesuviano-700 px-6 py-3 rounded-full font-inter">
                    {app}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Coatings (compact) */}
        <RivestimentiCompact />

        {/* Consultation Form */}
        <section id="consultation" className="py-20 bg-stone-50">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-4">
                {t('ovenDetails.traditional.ctaTitle')}
              </h2>
              <p className="text-lg text-stone-600">
                {t('ovenDetails.traditional.ctaText')}
              </p>
            </div>
            <ConsultationForm />
          </div>
        </section>
      </div>
  );
};

export default LocalizedTraditionalOven;
