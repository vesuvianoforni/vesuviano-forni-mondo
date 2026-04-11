
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/75"></div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-5 sm:px-6 text-center z-10 relative max-w-full py-8 sm:py-12">
        {/* Logo Section - hidden on mobile since it's in header */}
        <div className="mb-4 sm:mb-8 animate-scale-in hidden sm:block">
          <LazyImage 
            src="/lovable-uploads/vesuviano-logo-bianco.png"
            alt="Vesuviano - Forni artigianali napoletani di alta qualità" 
            className="h-12 sm:h-20 md:h-24 lg:h-32 w-auto mx-auto hover:scale-105 transition-transform duration-500"
            priority={true}
          />
        </div>
        
        {/* Pre-headline badge */}
        <div className="animate-fade-in mb-4 sm:mb-5">
          <span className="inline-block bg-white/10 backdrop-blur-sm text-white/90 text-[11px] sm:text-sm font-medium px-4 py-1.5 sm:px-5 sm:py-2 rounded-full border border-white/15 tracking-wide">
            {t('hero.subtitle')}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-playfair text-[26px] leading-[1.2] sm:text-2xl md:text-3xl lg:text-5xl font-bold mb-4 sm:mb-5 sm:leading-snug animate-fade-in text-white px-2 sm:px-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]" style={{ animationDelay: '0.3s' }}>
          {t('hero.title')}
        </h1>
        
        {/* Description */}
        <p className="font-inter text-[13px] leading-[1.6] sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto text-white/80 animate-fade-in px-3 sm:px-4" style={{ animationDelay: '0.5s' }}>
          {t('hero.description')}
        </p>

        {/* Customer Reviews Carousel */}
        <div className="w-full max-w-xl mx-auto px-6 sm:px-12 animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <Carousel className="w-full">
            <CarouselContent>
              {[1, 2, 3, 4, 5].map((num) => (
                <CarouselItem key={num}>
                  <div className="bg-white/[0.07] backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] mx-1 sm:mx-2">
                    <div className="flex justify-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-white text-[13px] sm:text-base text-center italic leading-relaxed">
                      "{t(`hero.review${num}`)}"
                    </p>
                    <p className="text-white/50 text-[11px] sm:text-sm text-center mt-2 sm:mt-3 font-medium">
                      — {t(`hero.reviewer${num}`)}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-2 sm:left-0 bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10" />
            <CarouselNext className="-right-2 sm:right-0 bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10" />
          </Carousel>
        </div>
        
        {/* Client Logos */}
        <div className="mt-6 sm:mt-8 animate-fade-in" style={{ animationDelay: '1s' }}>
          <p className="text-white/40 text-[10px] sm:text-xs text-center font-semibold uppercase tracking-[0.2em] mb-3 sm:mb-4">
            {t('hero.someClients')}
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-10">
            <img src="/lovable-uploads/client-logo-cugini-pizza.png" alt="Cugini Pizza" className="h-9 sm:h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            <img src="/lovable-uploads/client-logo-hands.png" alt="Client logo" className="h-9 sm:h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            <img src="/lovable-uploads/client-logo-ansun.png" alt="Ansun" className="h-9 sm:h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-6 sm:mt-8 animate-bounce" style={{ animationDelay: '1.2s' }}>
          <ArrowDown 
            className="mx-auto text-white/50 cursor-pointer hover:text-vesuviano-400 transition-colors hover:scale-125 duration-300" 
            size={22}
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
