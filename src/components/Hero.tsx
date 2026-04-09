
import { Button } from "@/components/ui/button";
import CtaButton from './CtaButton';
import { ArrowDown, Star, Phone } from "lucide-react";
import { useTranslation } from 'react-i18next';
import LazyImage from './LazyImage';
const laboratorioHero = '/hero.webp';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Hero = () => {
  const { t, i18n } = useTranslation();

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToConsultation = () => {
    document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentLang = i18n.language || 'it';

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden pt-16 sm:pt-20">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={laboratorioHero}
          alt="Laboratorio artigianale Vesuviano - Produzione artigianale di forni napoletani a legna, gas ed elettrici"
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
          decoding="sync"
          loading="eager"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/70"></div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 text-center z-10 relative max-w-full py-6 sm:py-12">
        {/* Logo Section */}
        <div className="mb-4 sm:mb-8 animate-scale-in">
          <LazyImage 
            src="/lovable-uploads/vesuviano-logo-bianco.png"
            alt="Vesuviano - Forni artigianali napoletani di alta qualità" 
            className="h-12 sm:h-20 md:h-24 lg:h-32 w-auto mx-auto hover:scale-105 transition-transform duration-500"
            priority={true}
          />
        </div>
        
        {/* Pre-headline badge */}
        <div className="animate-fade-in mb-3 sm:mb-4">
          <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/20">
            {t('hero.subtitle')}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-playfair text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold mb-3 sm:mb-5 leading-snug animate-fade-in text-white px-1 sm:px-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" style={{ animationDelay: '0.3s' }}>
          {t('hero.title')}
        </h1>
        
        {/* Description */}
        <p className="font-inter text-sm sm:text-base md:text-lg lg:text-xl mb-5 sm:mb-8 max-w-2xl mx-auto leading-relaxed text-white/90 animate-fade-in px-1 sm:px-4" style={{ animationDelay: '0.5s' }}>
          {t('hero.description')}
        </p>

        {/* CTA Buttons - visible above the fold on mobile */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-5 sm:mb-8 animate-scale-in px-2" style={{ animationDelay: '0.7s' }}>
          <Button
            onClick={scrollToProducts}
            size="lg"
            className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-6 py-5 sm:py-6 text-sm sm:text-base font-bold transition-all duration-300 hover:scale-105 shadow-xl w-full sm:w-auto"
          >
            {t('hero.discoverOvens')}
          </Button>
          <Button
            onClick={scrollToConsultation}
            variant="outline"
            size="lg"
            className="border-white/40 text-white hover:bg-white/15 px-6 py-5 sm:py-6 text-sm sm:text-base font-medium transition-all duration-300 w-full sm:w-auto backdrop-blur-sm"
          >
            <Phone className="w-4 h-4 mr-2" />
            {t('hero.freeConsultation')}
          </Button>
        </div>

        {/* Customer Reviews Carousel */}
        <div className="w-full max-w-xl mx-auto px-8 sm:px-12 animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <Carousel className="w-full">
            <CarouselContent>
              {[1, 2, 3, 4, 5].map((num) => (
                <CarouselItem key={num}>
                  <div className="bg-white/8 backdrop-blur-md rounded-lg p-3 sm:p-5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] mx-1 sm:mx-2">
                    <div className="flex justify-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-white text-xs sm:text-base text-center italic leading-relaxed">
                      "{t(`hero.review${num}`)}"
                    </p>
                    <p className="text-white/60 text-[10px] sm:text-sm text-center mt-2 sm:mt-3 font-medium">
                      - {t(`hero.reviewer${num}`)}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 bg-white/10 border-white/20 text-white hover:bg-white/20 h-7 w-7 sm:h-10 sm:w-10" />
            <CarouselNext className="right-0 bg-white/10 border-white/20 text-white hover:bg-white/20 h-7 w-7 sm:h-10 sm:w-10" />
          </Carousel>
        </div>
        
        {/* Proof Bar */}
        <div className="mt-3 sm:mt-4 animate-fade-in" style={{ animationDelay: '1.1s' }}>
          <p className="text-white/70 text-[10px] sm:text-sm text-center font-medium">
            {t('hero.proofBar')}
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-4 sm:mt-8 animate-bounce" style={{ animationDelay: '1.2s' }}>
          <ArrowDown 
            className="mx-auto text-white/70 cursor-pointer hover:text-vesuviano-400 transition-colors hover:scale-125 duration-300" 
            size={20}
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
