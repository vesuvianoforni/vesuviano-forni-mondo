
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

const Services = () => {
  const { t } = useTranslation();
  const services = [
    {
      title: t('services.consultation.title'),
      description: t('services.consultation.description'),
      features: [
        t('services.consultation.features.0'),
        t('services.consultation.features.1'),
        t('services.consultation.features.2'),
        t('services.consultation.features.3')
      ]
    },
    {
      title: t('services.design.title'),
      description: t('services.design.description'),
      features: [
        t('services.design.features.0'),
        t('services.design.features.1'),
        t('services.design.features.2'),
        t('services.design.features.3')
      ]
    },
    {
      title: t('services.logistics.title'),
      description: t('services.logistics.description'),
      features: [
        t('services.logistics.features.0'),
        t('services.logistics.features.1'),
        t('services.logistics.features.2'),
        t('services.logistics.features.3')
      ]
    },
    {
      title: t('services.training.title'),
      description: t('services.training.description'),
      features: [
        t('services.training.features.0'),
        t('services.training.features.1'),
        t('services.training.features.2'),
        t('services.training.features.3')
      ]
    }
  ];

  return (
    <section className="py-20 bg-white">      
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-6">
              {t('services.title')}
            </h2>
            <p className="font-inter text-xl text-stone-600 max-w-3xl mx-auto">
              {t('services.subtitle')}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => (
              <div 
                key={service.title}
                className="bg-stone-50 rounded-xl p-8 hover:shadow-lg transition-all duration-500 hover:scale-105 animate-fade-in group border border-stone-200 hover:border-vesuviano-300"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <h3 className="font-playfair text-2xl font-semibold text-charcoal-900 mb-4 group-hover:text-vesuviano-600 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  {service.description}
                </p>

                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li 
                      key={feature} 
                      className="flex items-center text-sm text-stone-600 hover:text-vesuviano-600 transition-colors duration-300 hover:translate-x-1"
                      style={{ transitionDelay: `${idx * 0.1}s` }}
                    >
                      <div className="w-2 h-2 bg-vesuviano-500 rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center animate-scale-in" style={{ animationDelay: '0.8s' }}>
            <div className="bg-vesuviano-50 rounded-xl p-8 max-w-3xl mx-auto border border-vesuviano-200 hover:shadow-xl transition-all duration-500 hover:scale-105">
              <h4 className="font-playfair text-2xl font-semibold text-charcoal-900 mb-4">
                {t('services.cta.title')}
              </h4>
              <p className="text-stone-600 mb-6">
                {t('services.cta.description')}
              </p>
              <Button 
                size="lg"
                className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-8 py-3 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('services.cta.button')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Logistics Photo Section */}
      <div className="container mx-auto px-6 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-playfair text-2xl md:text-3xl font-semibold text-charcoal-900 mb-4">
              {t('services.logistics.sectionTitle')}
            </h3>
            <p className="text-stone-600 text-lg">
              {t('services.logistics.sectionSubtitle')}
            </p>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
            <img 
              src="/lovable-uploads/logistica-internazionale-nyc.png"
              alt="Consegna forno Vesuviano a New York - Logistica internazionale efficace"
              className="w-full h-64 md:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-vesuviano-900/60 via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h4 className="font-playfair text-xl md:text-2xl font-semibold mb-2">
                {t('services.logistics.photoTitle')}
              </h4>
              <p className="text-stone-200 text-sm md:text-base">
                {t('services.logistics.photoDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
