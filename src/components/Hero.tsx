
import { Button } from "@/components/ui/button";
import { ArrowDown, Star } from "lucide-react";
import { useTranslation } from 'react-i18next';
import LazyImage from './LazyImage';
import laboratorioHero from '@/assets/laboratorio-artigianale-hero.png';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Hero = () => {
  const { t } = useTranslation();

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden pt-20">
      {/* Background Image */}
      <div className="absolute inset-0">
        <LazyImage
          src={laboratorioHero}
          alt="Laboratorio artigianale Vesuviano - Produzione artigianale di forni napoletani a legna, gas ed elettrici"
          className="w-full h-full object-cover object-center"
          priority={true}
        />
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-6 text-center z-10 relative max-w-full py-8 sm:py-12">
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
          <p className="block text-white text-base sm:text-lg md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 animate-slide-in-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{t('hero.subtitle')}</p>
          <h1 className="block animate-slide-in-right" style={{ animationDelay: '0.3s' }}>{t('hero.title')}</h1>
        </div>
        
        <p className="font-inter text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed text-gray-200 animate-fade-in px-2 sm:px-4" style={{ animationDelay: '0.6s' }}>
          {t('hero.description')}
        </p>

        <div className="flex flex-col items-center gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 animate-scale-in px-2 sm:px-4" style={{ animationDelay: '0.9s' }}>
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-white/60 text-white bg-white/10 hover:bg-white/20 hover:border-white/80 backdrop-blur-md px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base md:text-lg font-medium transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            onClick={scrollToProducts}
          >
            {t('hero.discoverOvens')}
          </Button>
          
          {/* Ready to Ship Section */}
          <div className="mt-6 sm:mt-8 w-full max-w-3xl mx-auto bg-gradient-to-r from-vesuviano-600/20 via-vesuviano-500/20 to-vesuviano-600/20 backdrop-blur-md rounded-2xl p-6 sm:p-8 border-2 border-vesuviano-400/30 shadow-[0_0_40px_rgba(255,87,34,0.15)] animate-fade-in" style={{ animationDelay: '1.1s' }}>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-white mb-2">
                {t('hero.readyToShip.title')}
              </h2>
              <p className="text-base sm:text-lg text-vesuviano-200 font-semibold mb-4">
                {t('hero.readyToShip.subtitle')}
              </p>
              <p className="text-sm sm:text-base text-white/90 mb-6 leading-relaxed">
                {t('hero.readyToShip.description')}
              </p>
              <Button 
                size="lg"
                className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-6 sm:px-8 py-3 text-base sm:text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
                onClick={() => {
                  const lang = localStorage.getItem('i18nextLng') || 'it';
                  window.location.href = `/${lang}/pronta-consegna`;
                }}
              >
                {t('hero.readyToShip.cta')}
              </Button>
            </div>
          </div>
          
          {/* Customer Reviews Carousel */}
          <div className="mt-4 sm:mt-6 w-full max-w-xl mx-auto px-8 sm:px-12 animate-fade-in" style={{ animationDelay: '1.3s' }}>
            <Carousel className="w-full">
              <CarouselContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <CarouselItem key={num}>
                    <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 sm:p-5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] mx-2">
                      <div className="flex justify-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-white text-sm sm:text-base text-center italic leading-relaxed min-h-[60px] flex items-center justify-center">
                        "{t(`hero.review${num}`)}"
                      </p>
                      <p className="text-white/70 text-xs sm:text-sm text-center mt-3 font-medium">
                        - {t(`hero.reviewer${num}`)}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10" />
              <CarouselNext className="right-0 bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10" />
            </Carousel>
          </div>
          
          {/* Proof Bar */}
          <div className="mt-3 sm:mt-4 animate-fade-in" style={{ animationDelay: '1.5s' }}>
            <p className="text-white/80 text-xs sm:text-sm text-center font-medium">
              {t('hero.proofBar')}
            </p>
          </div>
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
