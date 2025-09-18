
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

const CraftsmanshipSection = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-stone-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-6">
              {t('craftsmanship.title')} <span className="text-vesuviano-600">{t('craftsmanship.titleHighlight')}</span>
            </h2>
            <p className="font-inter text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
              {t('craftsmanship.subtitle')}
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Content */}
            <div className="animate-slide-in-left">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-500">
                <h3 className="font-playfair text-3xl font-semibold text-charcoal-900 mb-6">
                  {t('craftsmanship.traditionLives.title')}
                </h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  {t('craftsmanship.traditionLives.description')}
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-vesuviano-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-charcoal-900 mb-1">{t('craftsmanship.traditionLives.features.manual.title')}</h4>
                      <p className="text-sm text-stone-600">{t('craftsmanship.traditionLives.features.manual.description')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-vesuviano-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-charcoal-900 mb-1">{t('craftsmanship.traditionLives.features.materials.title')}</h4>
                      <p className="text-sm text-stone-600">{t('craftsmanship.traditionLives.features.materials.description')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-vesuviano-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-charcoal-900 mb-1">{t('craftsmanship.traditionLives.features.expertise.title')}</h4>
                      <p className="text-sm text-stone-600">{t('craftsmanship.traditionLives.features.expertise.description')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Image */}
            <div className="animate-slide-in-right">
              <div className="relative">
                <img 
                  src="/lovable-uploads/artigiano-mani-argilla.jpg" 
                  alt="Mani esperte di artigiano napoletano che lavora l'argilla refrattaria"
                  className="w-full rounded-xl shadow-lg hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h4 className="font-playfair text-xl font-bold mb-1">Napoli, Italia</h4>
                  <p className="text-sm opacity-90">Dove nasce l'eccellenza</p>
                </div>
              </div>
            </div>
          </div>

          {/* Laboratory Section */}
          <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="font-playfair text-3xl font-semibold text-charcoal-900 mb-4">
                    {t('craftsmanship.laboratory.title')}
                  </h3>
                  <p className="text-stone-600 leading-relaxed mb-4">
                    {t('craftsmanship.laboratory.description')}
                  </p>
                  <div className="flex items-center text-sm text-stone-500">
                    <div className="w-2 h-2 bg-vesuviano-500 rounded-full mr-2"></div>
                    <span>{t('craftsmanship.laboratory.location')}</span>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src="/lovable-uploads/laboratorio-sant-anastasia.png" 
                    alt="Laboratorio artigianale Vesuviano a Sant'Anastasia, Napoli - produzione forni a legna"
                    className="w-full rounded-lg shadow-md hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center group animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-vesuviano-50 transition-colors duration-300">
                <span className="text-3xl font-playfair font-bold text-vesuviano-600">100+</span>
              </div>
              <h4 className="font-semibold text-charcoal-900 mb-2">{t('craftsmanship.stats.years')}</h4>
              <p className="text-sm text-stone-600">{t('craftsmanship.stats.yearsDescription')}</p>
            </div>

            <div className="text-center group animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-vesuviano-50 transition-colors duration-300">
                <span className="text-3xl font-playfair font-bold text-vesuviano-600">15</span>
              </div>
              <h4 className="font-semibold text-charcoal-900 mb-2">{t('craftsmanship.stats.masters')}</h4>
              <p className="text-sm text-stone-600">{t('craftsmanship.stats.mastersDescription')}</p>
            </div>

            <div className="text-center group animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-vesuviano-50 transition-colors duration-300">
                <span className="text-3xl font-playfair font-bold text-vesuviano-600">∞</span>
              </div>
              <h4 className="font-semibold text-charcoal-900 mb-2">{t('craftsmanship.stats.passion')}</h4>
              <p className="text-sm text-stone-600">{t('craftsmanship.stats.passionDescription')}</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-vesuviano-50 rounded-xl p-8 animate-scale-in" style={{ animationDelay: '0.8s' }}>
            <h3 className="font-playfair text-3xl font-bold text-charcoal-900 mb-4">
              {t('craftsmanship.cta.title')}
            </h3>
            <p className="text-stone-600 mb-6 max-w-2xl mx-auto">
              {t('craftsmanship.cta.description')}
            </p>
            <Button 
              size="lg"
              className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-8 py-3 transition-all duration-300 hover:scale-105"
              onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('craftsmanship.cta.button')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CraftsmanshipSection;
