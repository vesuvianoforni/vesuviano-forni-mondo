
import { Button } from "@/components/ui/button";
import CtaButton from './CtaButton';
import { ArrowDown, Phone } from "lucide-react";
import { useTranslation } from 'react-i18next';
import LazyImage from './LazyImage';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
const laboratorioHero = '/hero.webp';

const Hero = () => {
  const { t, i18n } = useTranslation();
  const [callPhone, setCallPhone] = useState('');
  const [callLoading, setCallLoading] = useState(false);
  const [callSent, setCallSent] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      {/* Background: image first for LCP, video loads after interaction */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster={laboratorioHero}
          className="w-full h-full object-cover object-center absolute inset-0"
        >
          <source src="/videos/built-on-place-bg.mp4" type="video/mp4" />
        </video>
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
