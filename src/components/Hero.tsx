
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { useTranslation, Trans } from 'react-i18next';
import LazyImage from './LazyImage';

const Hero = () => {
  const { t } = useTranslation();

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToArchitettoAI = () => {
    document.getElementById('ai-architect')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden pt-20">
      {/* Background Image */}
      <div className="absolute inset-0">
        <LazyImage
          src="/lovable-uploads/mattoni-refrattari-hero.jpg"
          alt="Mattoni refrattari per forni a legna - Materiali di alta qualità per la costruzione di forni tradizionali napoletani"
          className="w-full h-full object-cover object-center"
          priority={true}
        />
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-6 text-center z-10 relative max-w-full">
        {/* Logo Section */}
        <div className="mb-6 sm:mb-8 animate-scale-in">
          <LazyImage 
            src="/lovable-uploads/vesuviano-logo-bianco.png"
            alt="Vesuviano - Forni artigianali napoletani di alta qualità, specializzati in forni a legna, gas ed elettrici" 
            className="h-16 sm:h-20 md:h-24 lg:h-32 w-auto mx-auto hover:scale-105 transition-transform duration-500"
            priority={true}
          />
        </div>
        
        <div className="font-playfair text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight animate-fade-in text-white px-2 sm:px-4">
          <p className="block text-vesuviano-400 text-base sm:text-lg md:text-2xl lg:text-3xl font-medium mb-1 sm:mb-2 animate-slide-in-left">{t('hero.subtitle')}</p>
          <h1 className="block animate-slide-in-right" style={{ animationDelay: '0.3s' }}>{t('hero.title')}</h1>
        </div>
        
        <p className="font-inter text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed text-gray-200 animate-fade-in px-2 sm:px-4" style={{ animationDelay: '0.6s' }}>
          <Trans 
            i18nKey="hero.description"
            components={{
              vesuvioBuono: <span 
                className="text-vesuviano-400 font-semibold cursor-pointer hover:text-vesuviano-300 hover:scale-105 transition-all duration-300 hover:drop-shadow-lg hover:brightness-125" 
                onClick={() => document.getElementById('vesuviobuono')?.scrollIntoView({ behavior: 'smooth' })}
              />
            }}
          />
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 animate-scale-in px-2 sm:px-4" style={{ animationDelay: '0.9s' }}>
          <Button 
            size="lg" 
            className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl w-full sm:w-auto"
            onClick={scrollToProducts}
          >
            {t('hero.discoverOvens')}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-vesuviano-500 text-vesuviano-500 hover:bg-vesuviano-500 hover:text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl w-full sm:w-auto"
            onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('hero.freeConsultation')}
          </Button>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl w-full sm:w-auto relative overflow-hidden"
            onClick={scrollToArchitettoAI}
          >
            <span className="relative z-10">🆕 Architetto AI</span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-6 sm:mt-8 animate-bounce" style={{ animationDelay: '1.2s' }}>
          <ArrowDown 
            className="mx-auto text-white cursor-pointer hover:text-vesuviano-400 transition-colors hover:scale-125 duration-300 drop-shadow-lg" 
            size={24}
            onClick={scrollToProducts}
          />
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-stone-50 to-transparent"></div>
    </section>
  );
};

export default Hero;
