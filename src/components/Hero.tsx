
import { Button } from "@/components/ui/button";
import { ArrowDown, Flame, Zap, RotateCw, TreePine, Building2, Sparkles } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LazyImage from './LazyImage';
import { useEffect, useState, useRef } from 'react';
import OvenFinderQuizModal from './OvenFinderQuizModal';
import { supabase } from "@/integrations/supabase/client";
const laboratorioHero = '/hero.webp';

const fallbackByLang: Record<string, { name: string; flag: string }> = {
  it: { name: 'Italia', flag: '🇮🇹' },
  en: { name: 'United Kingdom', flag: '🇬🇧' },
  fr: { name: 'France', flag: '🇫🇷' },
  de: { name: 'Deutschland', flag: '🇩🇪' },
  es: { name: 'España', flag: '🇪🇸' },
};

const Hero = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [geo, setGeo] = useState<{ name: string; flag: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('visitor-geo');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.name && parsed?.flag) { setGeo(parsed); return; }
      } catch {}
    }
    supabase.functions.invoke('geo-detect').then(({ data }) => {
      if (!data?.country_name) return;
      // Try to localize country name in current UI language
      let localized = data.country_name as string;
      try {
        const dn = new (Intl as any).DisplayNames([i18n.language || 'en'], { type: 'region' });
        localized = dn.of(data.country_code) || data.country_name;
      } catch {}
      const result = { name: localized, flag: data.flag };
      setGeo(result);
      sessionStorage.setItem('visitor-geo', JSON.stringify(result));
    }).catch(() => {});
  }, [i18n.language]);


  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black/85"></div>
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
        
        {/* Pre-headline - geo-aware text with country flag */}
        <div className="animate-fade-in mb-4 sm:mb-5">
          <span className="text-white/80 text-[11px] sm:text-sm font-medium tracking-[0.25em] uppercase">
            {t('hero.subtitlePrefix', { defaultValue: 'For pizzerias and restaurants in' })}{' '}
            <span className="text-white normal-case tracking-normal font-semibold">
              {(geo || fallbackByLang[i18n.language] || fallbackByLang.en).flag}{' '}
              {(geo || fallbackByLang[i18n.language] || fallbackByLang.en).name}
            </span>
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
                    setQuizOpen(true);
                  }
                }}
                className={`group flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5 transition-all duration-300 hover:scale-105 ${
                  isSelected
                    ? 'bg-vesuviano-600/40 border-2 border-vesuviano-400 shadow-[0_0_16px_rgba(200,120,50,0.3)]'
                    : 'bg-white/[0.08] hover:bg-vesuviano-600/30 border border-white/15 hover:border-vesuviano-400/50'
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

        {/* AI Oven Finder CTA - mobile + desktop */}
        <div className="w-full max-w-md mx-auto mb-5 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="bg-white/[0.07] backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-vesuviano-400" />
              <span className="text-vesuviano-300 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase">
                {t('hero.quizBadge', 'AI Oven Finder')}
              </span>
            </div>
            <h3 className="text-white text-sm sm:text-base font-semibold text-center mb-1">
              {t('hero.quizTitle', "Not sure which oven is right for you?")}
            </h3>
            <p className="text-white/70 text-[11px] sm:text-xs text-center mb-3">
              {t('hero.quizSubtitle', 'Answer 4 quick questions and our AI finds your perfect match')}
            </p>
            <Button
              onClick={() => setQuizOpen(true)}
              size="lg"
              className="w-full bg-vesuviano-600 hover:bg-vesuviano-700 text-white font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t('hero.quizCta', 'Find my perfect oven')}
            </Button>
            <p className="text-white/40 text-[10px] text-center mt-2">
              {t('hero.quizFooter', 'Free • Personalized • Takes 60 seconds')}
            </p>
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

      <OvenFinderQuizModal open={quizOpen} onOpenChange={setQuizOpen} />
    </section>
  );
};

export default Hero;
