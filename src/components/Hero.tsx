
import { Button } from "@/components/ui/button";
import CtaButton from './CtaButton';
import { ArrowDown, Phone, Flame, Zap, RotateCw, TreePine, Building2, CalendarClock } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LazyImage from './LazyImage';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
const laboratorioHero = '/hero.webp';

const Hero = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [callPhone, setCallPhone] = useState('');
  const [callLoading, setCallLoading] = useState(false);
  const [callSent, setCallSent] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [callHighlight, setCallHighlight] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const callSectionRef = useRef<HTMLDivElement>(null);

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

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 animate-fade-in px-2" style={{ animationDelay: '0.7s' }}>
          {[
            { icon: TreePine, labelKey: 'hero.catWood', fallback: 'Wood', path: { it: '/it/forni-tradizionali', en: '/en/traditional-ovens', fr: '/fr/fours-traditionnels', es: '/es/hornos-tradicionales', de: '/de/traditionelle-oefen' } },
            { icon: Flame, labelKey: 'hero.catGas', fallback: 'Gas', path: { it: '/it/forni-gas', en: '/en/gas-ovens', fr: '/fr/fours-gaz', es: '/es/hornos-gas', de: '/de/gasoefen' } },
            { icon: RotateCw, labelKey: 'hero.catRotating', fallback: 'Rotating', path: { it: '/it/forni-rotanti', en: '/en/rotating-ovens', fr: '/fr/fours-rotatifs', es: '/es/hornos-rotativos', de: '/de/drehoefen' } },
            { icon: Zap, labelKey: 'hero.catElectric', fallback: 'Electric', path: { it: '/it/forni-elettrici', en: '/en/electric-ovens', fr: '/fr/fours-electriques', es: '/es/hornos-electricos', de: '/de/elektrooefen' } },
            { icon: Building2, labelKey: 'hero.catBuiltOnPlace', fallback: 'Built on Place', path: { it: '/built-on-place', en: '/built-on-place', fr: '/built-on-place', es: '/built-on-place', de: '/built-on-place' } },
          ].map((cat) => {
            const Icon = cat.icon;
            const lang = (i18n.language || 'it') as keyof typeof cat.path;
            const isSelected = selectedCat === cat.labelKey;
            return (
              <button
                key={cat.labelKey}
                onClick={() => {
                  if (isSelected) {
                    navigate(cat.path[lang] || cat.path.it);
                  } else {
                    setSelectedCat(cat.labelKey);
                    setCallHighlight(true);
                    callSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => setCallHighlight(false), 2000);
                  }
                }}
                className={`group flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5 transition-all duration-300 hover:scale-105 ${
                  isSelected
                    ? 'bg-vesuviano-600/40 border-2 border-vesuviano-400 shadow-[0_0_16px_rgba(200,120,50,0.3)]'
                    : 'bg-white/[0.08] hover:bg-white/[0.18] border border-white/15 hover:border-white/30'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isSelected ? 'text-vesuviano-300' : 'text-vesuviano-400 group-hover:text-vesuviano-300'}`} />
                <span className={`text-[11px] sm:text-sm font-medium tracking-wide ${isSelected ? 'text-white' : 'text-white/90'}`}>
                  {t(cat.labelKey, cat.fallback)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Call Me Section - Mobile */}
        <div ref={callSectionRef} className={`sm:hidden w-full max-w-xs mx-auto mb-5 animate-fade-in transition-all duration-500 ${callHighlight ? 'scale-105 ring-2 ring-vesuviano-400 rounded-xl' : ''}`} style={{ animationDelay: '0.8s' }}>
          {!callSent ? (
            <div className={`bg-white/[0.07] backdrop-blur-md rounded-xl p-3 border transition-colors duration-500 ${callHighlight ? 'border-vesuviano-400 bg-white/[0.12]' : 'border-white/10'}`}>
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
              <button
                onClick={() => navigate('/book-a-slot-call')}
                className="flex items-center justify-center gap-1.5 w-full mt-2 text-white/50 hover:text-white/80 text-[10px] transition-colors"
              >
                <CalendarClock className="w-3 h-3" />
                {t('hero.scheduleOther', 'Schedule at a more convenient time')}
              </button>
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
