
import { Button } from "@/components/ui/button";
import CtaButton from './CtaButton';
import { ArrowDown, Star, Phone } from "lucide-react";
import { useTranslation } from 'react-i18next';
import LazyImage from './LazyImage';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
const laboratorioHero = '/hero.webp';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Hero = () => {
  const { t, i18n } = useTranslation();
  const [callPhone, setCallPhone] = useState('');
  const [callLoading, setCallLoading] = useState(false);
  const [callSent, setCallSent] = useState(false);

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToConsultation = () => {
    document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCallMe = async () => {
    if (!callPhone.trim()) return;
    setCallLoading(true);
    try {
      await supabase.from('website_leads').insert({
        phone: callPhone.trim(),
        form_type: 'hero_callback',
        status: 'new',
        notes: 'Richiesta callback da Hero section',
      });
      await supabase.functions.invoke('send-form-data', {
        body: {
          formType: 'hero_callback',
          data: { phone: callPhone.trim() },
        },
      });
      setCallSent(true);
      toast.success(t('hero.callbackSuccess', 'We\'ll call you shortly!'));
    } catch (e) {
      toast.error('Error, please try again');
    } finally {
      setCallLoading(false);
    }
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
        
        {/* Pre-headline - elegant simple text */}
        <div className="animate-fade-in mb-4 sm:mb-5">
          <span className="text-white/80 text-[11px] sm:text-sm font-medium tracking-[0.25em] uppercase">
            {t('hero.subtitle')}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-playfair text-[26px] leading-[1.2] sm:text-2xl md:text-3xl lg:text-5xl font-bold mb-4 sm:mb-5 sm:leading-snug animate-fade-in text-white px-2 sm:px-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] whitespace-pre-line" style={{ animationDelay: '0.3s' }}>
          {t('hero.title')}
        </h1>
        
        {/* Description */}
        <p className="font-inter text-[13px] leading-[1.6] sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto text-white/80 animate-fade-in px-3 sm:px-4" style={{ animationDelay: '0.5s' }}>
          {t('hero.description')}
        </p>

        {/* Call Me Section - Mobile */}
        <div className="sm:hidden w-full max-w-xs mx-auto mb-5 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          {!callSent ? (
            <div className="bg-white/[0.07] backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Phone className="w-3.5 h-3.5 text-vesuviano-400" />
                <span className="text-white/90 text-[11px] font-medium">
                  {t('hero.callMe', 'Insert your number, we\'ll call you in 5 min')}
                </span>
              </div>
              <p className="text-white/40 text-[9px] text-center mb-2">(9:00 - 19:00 CET)</p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={callPhone}
                  onChange={(e) => setCallPhone(e.target.value)}
                  placeholder="+39 333..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-vesuviano-400"
                />
                <Button
                  onClick={handleCallMe}
                  disabled={callLoading || !callPhone.trim()}
                  size="sm"
                  className="bg-vesuviano-600 hover:bg-vesuviano-700 text-white text-xs px-3"
                >
                  <Phone className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.07] backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <p className="text-white/90 text-xs">✅ {t('hero.callbackSuccess', 'We\'ll call you shortly!')}</p>
            </div>
          )}
        </div>

        {/* Customer Reviews Carousel - 3 real clients */}
        <div className="w-full max-w-xl mx-auto px-6 sm:px-12 animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <Carousel className="w-full">
            <CarouselContent>
              {[
                { logo: '/lovable-uploads/client-logo-cugini-pizza.png', name: 'Cugini Pizza', reviewKey: 1 },
                { logo: '/lovable-uploads/client-logo-hands.png', name: 'Rosso Mazara', reviewKey: 2 },
                { logo: '/lovable-uploads/client-logo-ansun.png', name: 'Ansun', reviewKey: 3 },
              ].map((client) => (
                <CarouselItem key={client.name}>
                  <div className="bg-white/[0.07] backdrop-blur-md rounded-xl p-3 sm:p-5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] mx-1 sm:mx-2">
                    {/* Client Logo */}
                    <div className="flex justify-center mb-2 sm:mb-3">
                      <img
                        src={client.logo}
                        alt={client.name}
                        className="h-8 sm:h-12 w-auto opacity-80"
                      />
                    </div>

                    <div className="flex justify-center gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    <p className="text-white text-[11px] sm:text-base text-center italic leading-relaxed">
                      "{t(`hero.review${client.reviewKey}`)}"
                    </p>

                    <p className="text-white/60 text-[10px] sm:text-sm text-center mt-1.5 sm:mt-3 font-semibold">
                      — {client.name}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-2 sm:left-0 bg-white/10 border-white/20 text-white hover:bg-white/20 h-7 w-7 sm:h-10 sm:w-10" />
            <CarouselNext className="-right-2 sm:right-0 bg-white/10 border-white/20 text-white hover:bg-white/20 h-7 w-7 sm:h-10 sm:w-10" />
          </Carousel>
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
