import { useTranslation } from 'react-i18next';
import { Compass, Palette, Truck, GraduationCap } from 'lucide-react';
import CtaButton from './CtaButton';

const Services = () => {
  const { t } = useTranslation();

  const services = [
    { key: 'consultation', Icon: Compass },
    { key: 'design', Icon: Palette },
    { key: 'logistics', Icon: Truck },
    { key: 'training', Icon: GraduationCap },
  ];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-12">
            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-charcoal-900 mb-4">
              {t('services.title')} <span className="text-vesuviano-600">{t('services.titleHighlight')}</span>
            </h2>
            <p className="font-inter text-base md:text-lg text-stone-600 max-w-2xl mx-auto">
              {t('services.subtitle')}
            </p>
          </div>

          {/* Compact services grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            {services.map(({ key, Icon }) => (
              <div
                key={key}
                className="group bg-stone-50 rounded-xl p-5 md:p-6 border border-stone-200 hover:border-vesuviano-300 hover:shadow-md transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-vesuviano-100 text-vesuviano-600 flex items-center justify-center group-hover:bg-vesuviano-600 group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-playfair text-base md:text-lg font-semibold text-charcoal-900 mb-1">
                  {t(`services.${key}.title`)}
                </h3>
                <p className="text-xs md:text-sm text-stone-600 leading-snug">
                  {t(`services.${key}.description`)}
                </p>
              </div>
            ))}
          </div>

          {/* Logistics highlight + CTA combined */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl group">
            <img
              src="/lovable-uploads/logistica-internazionale-nyc.webp"
              alt="Vesuviano oven delivery in New York - International logistics"
              loading="lazy"
              className="w-full h-64 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-vesuviano-900/85 via-vesuviano-900/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium mb-3 w-fit">
                  <Truck className="w-3.5 h-3.5" />
                  <span>{t('services.logisticsSection.titleHighlight')}</span>
                </div>
                <h3 className="font-playfair text-xl md:text-3xl font-bold text-white mb-2">
                  {t('services.logisticsSection.caption')}
                </h3>
                <p className="text-stone-100 text-sm md:text-base mb-5 max-w-xl">
                  {t('services.logisticsSection.description')}
                </p>
                <CtaButton className="px-6 py-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
