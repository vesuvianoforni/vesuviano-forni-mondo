
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageZoomModal from './ImageZoomModal';

const ProductCategories = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [zoomedImage, setZoomedImage] = useState<{
    url: string;
    alt: string;
    title: string;
  } | null>(null);

  const getOvenPath = (ovenType: string) => {
    const lang = i18n.language || 'it';
    const paths: Record<string, Record<string, string>> = {
      'traditional': {
        'it': '/it/forni-tradizionali',
        'en': '/en/traditional-ovens',
        'fr': '/fr/fours-traditionnels',
        'es': '/es/hornos-tradicionales',
        'de': '/de/traditionelle-oefen'
      },
      'gas': {
        'it': '/it/forni-gas',
        'en': '/en/gas-ovens',
        'fr': '/fr/fours-gaz',
        'es': '/es/hornos-gas',
        'de': '/de/gasoefen'
      },
      'electric': {
        'it': '/it/forni-elettrici',
        'en': '/en/electric-ovens',
        'fr': '/fr/fours-electriques',
        'es': '/es/hornos-electricos',
        'de': '/de/elektrooefen'
      },
      'rotating': {
        'it': '/it/forni-rotativi',
        'en': '/en/rotating-ovens',
        'fr': '/fr/fours-rotatifs',
        'es': '/es/hornos-rotativos',
        'de': '/de/drehoefen'
      },
      'vesuviobuono': {
        'it': '/it/sistema-vesuviobuono',
        'en': '/en/vesuviobuono-system',
        'fr': '/fr/systeme-vesuviobuono',
        'es': '/es/sistema-vesuviobuono',
        'de': '/de/vesuviobuono-system'
      }
    };
    return paths[ovenType]?.[lang] || paths[ovenType]?.['it'] || '/';
  };

  const categories = [
    {
      key: 'traditional',
      image: "/lovable-uploads/vesuviobuono-verde-mosaico.jpg"
    },
    {
      key: 'gas',
      image: "/lovable-uploads/forno-arancione-terra-del-gusto.png"
    },
    {
      key: 'electric',
      image: "/lovable-uploads/forno-metallo-bianco-nuovo.png"
    },
    {
      key: 'rotating',
      image: "/lovable-uploads/forno-rotativo-mosaico-nero.jpg"
    },
    {
      key: 'vesuviobuono',
      image: "/lovable-uploads/vesuviobuono-ostepizza-completo.png"
    }
  ];

  return (
    <section id="products" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-3 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-900 mb-3 sm:mb-4 px-2">
              {t('products.title')} <span className="text-vesuviano-600">{t('products.titleHighlight')}</span>
            </h2>
            <p className="font-inter text-base sm:text-lg text-stone-600 max-w-2xl mx-auto px-2">
              {t('products.subtitle')}
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
            {categories.map((category, index) => (
              <Card 
                key={category.key}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border border-stone-200 hover:border-vesuviano-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden cursor-zoom-in"
                     onClick={() => setZoomedImage({
                       url: category.image,
                       alt: t(`products.${category.key}.title`),
                       title: t(`products.${category.key}.title`)
                     })}>
                  <img 
                    src={category.image} 
                    alt={t(`products.${category.key}.title`)}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white">
                    <h3 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold mb-1">{t(`products.${category.key}.title`)}</h3>
                    <p className="text-xs sm:text-sm opacity-90 font-inter">{t(`products.${category.key}.subtitle`)}</p>
                  </div>
                </div>
                
                <CardContent className="p-4 sm:p-6">
                  <p className="text-stone-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                    {t(`products.${category.key}.description`)}
                  </p>
                  
                  <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                    {Object.keys(t(`products.${category.key}.features`, { returnObjects: true }) as object).map((featureKey) => (
                      <li 
                        key={featureKey}
                        className="flex items-center text-xs sm:text-sm text-stone-600 hover:text-vesuviano-600 transition-colors duration-300"
                      >
                        <div className="w-1.5 h-1.5 bg-vesuviano-500 rounded-full mr-3 flex-shrink-0"></div>
                        {t(`products.${category.key}.features.${featureKey}`)}
                      </li>
                    ))}
                  </ul>

                  {/* Distinctive Badges */}
                  <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                    <div className="inline-flex items-center px-3 py-1.5 bg-vesuviano-50 border border-vesuviano-200 rounded-full">
                      <span className="text-xs font-semibold text-vesuviano-700">
                        {t('products.badges.madeInNaples')}
                      </span>
                    </div>
                    <div className="inline-flex items-center px-3 py-1.5 bg-stone-100 border border-stone-300 rounded-full">
                      <span className="text-xs font-semibold text-stone-700">
                        {t('products.badges.certified')}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-stone-100 text-stone-700 hover:bg-vesuviano-500 hover:text-white transition-all duration-300 text-sm sm:text-base py-2 sm:py-3"
                    onClick={() => navigate(getOvenPath(category.key))}
                  >
                    {t('products.learnMore')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="text-center bg-stone-50 rounded-2xl p-6 sm:p-8 animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <h3 className="font-playfair text-xl sm:text-2xl md:text-3xl font-bold text-charcoal-900 mb-3 sm:mb-4 px-2">
              {t('products.customSolutions.title')}
            </h3>
            <p className="text-stone-600 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base px-2">
              {t('products.customSolutions.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('products.customSolutions.freeConsultation')}
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-vesuviano-500 text-vesuviano-600 hover:bg-vesuviano-500 hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 transition-all duration-300 text-sm sm:text-base"
                onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('products.customSolutions.viewGallery')}
              </Button>
            </div>
          </div>
        </div>

        {/* Image Zoom Modal */}
        {zoomedImage && (
          <ImageZoomModal
            isOpen={!!zoomedImage}
            onClose={() => setZoomedImage(null)}
            imageUrl={zoomedImage.url}
            imageAlt={zoomedImage.alt}
            title={zoomedImage.title}
          />
        )}
      </div>
    </section>
  );
};

export default ProductCategories;
