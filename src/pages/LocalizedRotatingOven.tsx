import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import RouteSEO from '@/components/RouteSEO';
import ConsultationForm from '@/components/ConsultationForm';
import RivestimentiCompact from '@/components/RivestimentiCompact';
import { Button } from '@/components/ui/button';
import CtaButton from '@/components/CtaButton';
import { Card, CardContent } from '@/components/ui/card';

interface LocalizedRotatingOvenProps {
  lang: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const LocalizedRotatingOven = ({ lang }: LocalizedRotatingOvenProps) => {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    loadLanguage(lang);
    document.documentElement.lang = lang;
    document.title = `${t('products.rotating.title')} - Vesuviano`;
  }, [lang, i18n, t]);

  return (
    <div className="min-h-screen bg-white">
        <Header />
        <RouteSEO
          lang={lang}
          title={`${t('products.rotating.title')} | Vesuviano Forni`}
          description={t('products.rotating.subtitle', { defaultValue: t('products.rotating.title') })}
        />
        
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
          <img 
            src="/lovable-uploads/vesuviobuono-osteria-pizza.webp"
            alt={t('products.rotating.title')}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
          <div className="relative h-full container mx-auto px-6 flex items-center">
            <div className="max-w-3xl text-white">
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {t('products.rotating.title')}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                {t('products.rotating.subtitle')}
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
                  {t('ovenDetails.rotating.aboutTitle')}
                </h2>
                <p className="text-lg text-stone-600 leading-relaxed mb-6">
                  {t('ovenDetails.rotating.aboutText1')}
                </p>
                <p className="text-lg text-stone-600 leading-relaxed">
                  {t('ovenDetails.rotating.aboutText2')}
                </p>
              </div>
              <div className="space-y-6">
                <img 
                  src="/lovable-uploads/vesuviobuono-marrone-completo.webp"
                  alt={t('products.rotating.title')}
                  className="w-full h-80 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Technical Features */}
            <div className="mb-20">
              <h3 className="font-playfair text-3xl font-bold text-charcoal-900 mb-8 text-center">
                {t('ovenDetails.rotating.featuresTitle')}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.keys(t('products.rotating.features', { returnObjects: true }) as object).map((featureKey) => (
                  <Card key={featureKey} className="border-stone-200 hover:border-vesuviano-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-vesuviano-100 rounded-full flex items-center justify-center mb-4">
                        <div className="w-6 h-6 bg-vesuviano-500 rounded-full"></div>
                      </div>
                      <h4 className="font-inter font-semibold text-charcoal-900 mb-2">
                        {t(`products.rotating.features.${featureKey}`)}
                      </h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-stone-50 rounded-2xl p-8 mb-20">
              <h3 className="font-playfair text-3xl font-bold text-charcoal-900 mb-8">
                {t('ovenDetails.rotating.specsTitle')}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.keys(t('ovenDetails.rotating.specs', { returnObjects: true }) as object).map((specKey) => (
                  <div key={specKey} className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-vesuviano-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-charcoal-900">{t(`ovenDetails.rotating.specs.${specKey}.label`)}:</strong>{' '}
                      <span className="text-stone-600">{t(`ovenDetails.rotating.specs.${specKey}.value`)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications */}
            <div className="text-center mb-20">
              <h3 className="font-playfair text-3xl font-bold text-charcoal-900 mb-6">
                {t('ovenDetails.rotating.applicationsTitle')}
              </h3>
              <p className="text-lg text-stone-600 max-w-3xl mx-auto mb-8">
                {t('ovenDetails.rotating.applicationsText')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {(t('ovenDetails.rotating.applications', { returnObjects: true }) as string[]).map((app, index) => (
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
                {t('ovenDetails.rotating.ctaTitle')}
              </h2>
              <p className="text-lg text-stone-600">
                {t('ovenDetails.rotating.ctaText')}
              </p>
            </div>
            <ConsultationForm />
          </div>
        </section>
      </div>
  );
};

export default LocalizedRotatingOven;
