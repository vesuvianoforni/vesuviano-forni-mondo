
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import CtaButton from './CtaButton';

const labels: Record<string, {
  sectionTitle: string;
  whereTitle: string;
  whereSubtitle: string;
  whereDescription: string;
}> = {
  it: {
    sectionTitle: 'Chi Siamo',
    whereTitle: 'Dove Siamo',
    whereSubtitle: 'Radicati alle pendici del Vesuvio',
    whereDescription: 'I nostri laboratori sorgono ai piedi del Vesuvio, in Campania. Utilizziamo la sabbia vulcanica nella produzione dei nostri forni, conferendo proprietà termiche uniche e un\'autenticità impossibile da replicare.',
  },
  en: {
    sectionTitle: 'About Us',
    whereTitle: 'Where We Are',
    whereSubtitle: 'Rooted at the foot of Vesuvius',
    whereDescription: 'Our workshops are located at the foot of Mount Vesuvius, in Campania. We use volcanic sand in our ovens, giving them unique thermal properties and authenticity impossible to replicate.',
  },
  fr: {
    sectionTitle: 'Qui Sommes-Nous',
    whereTitle: 'Où Nous Sommes',
    whereSubtitle: 'Enracinés au pied du Vésuve',
    whereDescription: 'Nos ateliers sont situés au pied du Vésuve, en Campanie. Nous utilisons le sable volcanique dans la production de nos fours, leur conférant des propriétés thermiques uniques.',
  },
  de: {
    sectionTitle: 'Über Uns',
    whereTitle: 'Wo Wir Sind',
    whereSubtitle: 'Verwurzelt am Fuße des Vesuvs',
    whereDescription: 'Unsere Werkstätten befinden sich am Fuße des Vesuvs in Kampanien. Wir verwenden vulkanischen Sand bei der Herstellung unserer Öfen, was ihnen einzigartige thermische Eigenschaften verleiht.',
  },
  es: {
    sectionTitle: 'Quiénes Somos',
    whereTitle: 'Dónde Estamos',
    whereSubtitle: 'Arraigados a los pies del Vesubio',
    whereDescription: 'Nuestros talleres están ubicados a los pies del Vesubio, en Campania. Utilizamos arena volcánica en la producción de nuestros hornos, otorgándoles propiedades térmicas únicas.',
  },
};

const AboutUs = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'it';
  const l = labels[lang] || labels.it;

  return (
    <section className="py-16 md:py-24 bg-stone-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-4">
              {l.sectionTitle}
            </h2>
            <p className="font-inter text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">
              {t('craftsmanship.subtitle')}
            </p>
          </div>

          {/* Craftsmanship + Where We Are Grid */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 mb-12">
            {/* Left: Craftsmanship */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
                <h3 className="font-playfair text-2xl md:text-3xl font-semibold text-charcoal-900 mb-4">
                  {t('craftsmanship.traditionLives.title')}
                </h3>
                <p className="text-stone-600 leading-relaxed mb-5 text-sm md:text-base">
                  {t('craftsmanship.traditionLives.description')}
                </p>
                
                <div className="space-y-3">
                  {['manual', 'materials', 'expertise'].map((key) => (
                    <div key={key} className="flex items-start">
                      <div className="w-2.5 h-2.5 bg-vesuviano-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-charcoal-900 text-sm mb-0.5">
                          {t(`craftsmanship.traditionLives.features.${key}.title`)}
                        </h4>
                        <p className="text-xs text-stone-600">
                          {t(`craftsmanship.traditionLives.features.${key}.description`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Artisan Image */}
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="/lovable-uploads/artigiano-mani-argilla.webp" 
                  alt="Mani esperte di artigiano napoletano che lavora l'argilla refrattaria"
                  className="w-full h-48 md:h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="font-playfair text-lg font-bold">Napoli, Italia</h4>
                  <p className="text-xs opacity-90">
                    {lang === 'it' ? 'Dove nasce l\'eccellenza' : 
                     lang === 'en' ? 'Where excellence is born' :
                     lang === 'fr' ? 'Où naît l\'excellence' :
                     lang === 'es' ? 'Donde nace la excelencia' :
                     'Wo Exzellenz entsteht'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Where We Are + Laboratory */}
            <div className="space-y-6">
              {/* Where We Are */}
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 bg-vesuviano-100 text-vesuviano-700 px-3 py-1 rounded-full text-xs font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Campania, Italia</span>
                  </div>
                </div>
                <h3 className="font-playfair text-2xl md:text-3xl font-semibold text-charcoal-900 mb-2">
                  {l.whereTitle}
                </h3>
                <p className="text-sm text-vesuviano-600 font-medium mb-2">{l.whereSubtitle}</p>
                <p className="text-stone-600 leading-relaxed text-sm md:text-base mb-4">
                  {l.whereDescription}
                </p>
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src="/lovable-uploads/vesuvio-mappa-laboratori.webp"
                    alt="Mappa dei laboratori Vesuviano alle pendici del Vesuvio"
                    className="w-full h-40 md:h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-2 left-2 text-white">
                    <p className="text-xs font-medium opacity-90">📍 Sant'Anastasia & Boscoreale (NA)</p>
                  </div>
                </div>
              </div>

              {/* Laboratory */}
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
                <h3 className="font-playfair text-xl md:text-2xl font-semibold text-charcoal-900 mb-3">
                  {t('craftsmanship.laboratory.title')}
                </h3>
                <p className="text-stone-600 leading-relaxed text-sm md:text-base mb-3">
                  {t('craftsmanship.laboratory.description')}
                </p>
                <div className="flex items-center text-xs text-stone-500 mb-4">
                  <div className="w-2 h-2 bg-vesuviano-500 rounded-full mr-2"></div>
                  <span>{t('craftsmanship.laboratory.location')}</span>
                </div>
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src="/lovable-uploads/laboratorio-sant-anastasia.webp" 
                    alt="Laboratorio artigianale Vesuviano a Sant'Anastasia"
                    className="w-full h-40 md:h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[
              { value: '100+', labelKey: 'craftsmanship.stats.years', descKey: 'craftsmanship.stats.yearsDescription' },
              { value: '15', labelKey: 'craftsmanship.stats.masters', descKey: 'craftsmanship.stats.mastersDescription' },
              { value: '∞', labelKey: 'craftsmanship.stats.passion', descKey: 'craftsmanship.stats.passionDescription' },
            ].map((stat) => (
              <div key={stat.labelKey} className="text-center">
                <div className="bg-white rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <span className="text-2xl md:text-3xl font-playfair font-bold text-vesuviano-600">{stat.value}</span>
                </div>
                <h4 className="font-semibold text-charcoal-900 text-sm mb-1">{t(stat.labelKey)}</h4>
                <p className="text-xs text-stone-600 hidden md:block">{t(stat.descKey)}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center bg-vesuviano-50 rounded-xl p-6 md:p-8">
            <h3 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-900 mb-3">
              {t('craftsmanship.cta.title')}
            </h3>
            <p className="text-stone-600 mb-5 max-w-2xl mx-auto text-sm md:text-base">
              {t('craftsmanship.cta.description')}
            </p>
            <CtaButton className="px-8 py-3" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
