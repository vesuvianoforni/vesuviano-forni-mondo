
import { Button } from "@/components/ui/button";
import CtaButton from './CtaButton';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import DownloadDatasheetModal from './DownloadDatasheetModal';
import ConsultationModal from './ConsultationModal';

const ProductCategories = () => {
  const { t, i18n } = useTranslation();
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [downloadModal, setDownloadModal] = useState<{
    ovenType: string;
    datasheetUrl?: string;
  } | null>(null);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const navigate = useNavigate();

  const getDatasheetUrl = (ovenType: string) => {
    const datasheetUrls: Record<string, string> = {
      'vesuviobuono': '/lovable-uploads/vesuviobuono-scheda-tecnica.pdf',
      // Add other datasheet URLs as needed
    };
    return datasheetUrls[ovenType];
  };

  const categories = [
    {
      key: 'traditional',
      image: "/lovable-uploads/vesuviobuono-verde-mosaico.webp",
      video: "/lovable-uploads/forno-360-video.mp4"
    },
    {
      key: 'gas',
      image: "/lovable-uploads/forno-gas-verde-mosaico.webp",
      video: "/lovable-uploads/forno-gas-360-video.mp4"
    },
    {
      key: 'electric',
      image: "/lovable-uploads/forno-metallo-bianco-nuovo.webp",
      video: "/lovable-uploads/forno-elettrico-360-video.mp4"
    },
    {
      key: 'rotating',
      image: "/lovable-uploads/forno-rotativo-mosaico-nero.webp",
      video: "/lovable-uploads/forno-rotativo-360-video.mp4"
    },
    {
      key: 'vesuviobuono',
      image: "/lovable-uploads/vesuviobuono-ostepizza-completo.webp",
      video: "/lovable-uploads/vesuviobuono-360-video.mp4"
    },
    {
      key: 'builtOnPlace',
      image: "/lovable-uploads/forni-colorati-showroom.webp",
      link: "/built-on-place"
    },
    {
      key: 'consultation',
      image: "/lovable-uploads/forni-colorati-showroom.webp"
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
            {categories.map((category, index) => {
              const isConsultation = category.key === 'consultation';
              
              return (
                <Card 
                  key={category.key}
                  className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 border animate-fade-in ${
                    isConsultation 
                      ? 'border-vesuviano-400 bg-gradient-to-br from-vesuviano-50 to-white' 
                      : 'border-stone-200 hover:border-vesuviano-300'
                  } ${!isConsultation && category.video && playingVideo !== category.key ? 'cursor-pointer' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div 
                    className={`relative h-64 sm:h-80 md:h-96 overflow-hidden`}
                    onClick={() => {
                      if (!isConsultation && category.video && playingVideo !== category.key) {
                        setPlayingVideo(category.key);
                      }
                    }}
                  >
                    {playingVideo === category.key && category.video ? (
                      <video
                        src={category.video}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <>
                        <img 
                          src={category.image} 
                          alt={t(`products.${category.key}.title`)}
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                        />
                        {!isConsultation && category.video && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center animate-pulse">
                              <svg className="w-8 h-8 text-vesuviano-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white">
                      <h3 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold mb-1">{t(`products.${category.key}.title`)}</h3>
                      <p className="text-xs sm:text-sm opacity-90 font-inter">{t(`products.${category.key}.subtitle`)}</p>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 sm:p-6">
                    {isConsultation ? (
                      <>
                        <p className="text-stone-700 font-medium mb-4 leading-relaxed text-sm sm:text-base">
                          {t(`products.${category.key}.description`)} 🍕
                        </p>
                        
                        <ul className="space-y-2 mb-6">
                          {Object.keys(t(`products.${category.key}.services`, { returnObjects: true }) as object).map((serviceKey) => (
                            <li 
                              key={serviceKey}
                              className="flex items-center text-sm text-stone-700 font-medium"
                            >
                              <div className="w-2 h-2 bg-vesuviano-500 rounded-full mr-3 flex-shrink-0"></div>
                              {t(`products.${category.key}.services.${serviceKey}`)}
                            </li>
                          ))}
                        </ul>

                        {/* Garanzia Badge */}
                        <div className="flex justify-center mb-6">
                          <div className="inline-flex items-center px-4 py-2 bg-green-50 border-2 border-green-400 rounded-full">
                            <span className="text-sm font-bold text-green-700">
                              ✓ {t('products.consultation.warranty')}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          size="lg"
                          className="w-full bg-vesuviano-600 hover:bg-vesuviano-700 text-white transition-all duration-300 text-base sm:text-lg py-6 font-semibold shadow-lg hover:shadow-xl"
                          onClick={() => setConsultationModalOpen(true)}
                        >
                          {t(`products.${category.key}.cta`)}
                        </Button>
                      </>
                    ) : (
                      <>
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
                          onClick={() => setDownloadModal({
                            ovenType: category.key,
                            datasheetUrl: getDatasheetUrl(category.key)
                          })}
                        >
                          {t('products.downloadDatasheet')}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
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
              <CtaButton className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base" />
              <Button 
                size="lg"
                variant="outline"
                className="border-vesuviano-500 text-vesuviano-600 hover:bg-vesuviano-500 hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 transition-all duration-300 text-sm sm:text-base"
                onClick={() => document.getElementById('oven-gallery')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('products.customSolutions.viewGallery')}
              </Button>
            </div>
          </div>
        </div>

        {/* Download Datasheet Modal */}
        {downloadModal && (
          <DownloadDatasheetModal
            isOpen={!!downloadModal}
            onClose={() => setDownloadModal(null)}
            ovenType={downloadModal.ovenType}
            datasheetUrl={downloadModal.datasheetUrl}
          />
        )}

        {/* Consultation Modal */}
        <ConsultationModal
          isOpen={consultationModalOpen}
          onClose={() => setConsultationModalOpen(false)}
        />
      </div>
    </section>
  );
};

export default ProductCategories;
