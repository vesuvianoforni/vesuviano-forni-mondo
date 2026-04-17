import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "@/integrations/supabase/client";

const clients = [
  { logo: '/lovable-uploads/client-logo-cugini-pizza.png', name: 'Cugini Pizza', reviewKey: 1 },
  { logo: '/lovable-uploads/client-logo-hands.png', name: 'Rosso Mazara', reviewKey: 2 },
  { logo: '/lovable-uploads/client-logo-ansun.png', name: 'Ansun', reviewKey: 3 },
];

// Fallback localized country name based on UI language
const fallbackByLang: Record<string, { name: string; flag: string }> = {
  it: { name: 'Italia', flag: '🇮🇹' },
  en: { name: 'United Kingdom', flag: '🇬🇧' },
  fr: { name: 'France', flag: '🇫🇷' },
  de: { name: 'Deutschland', flag: '🇩🇪' },
  es: { name: 'España', flag: '🇪🇸' },
};

const ReviewsStrip = () => {
  const { t, i18n } = useTranslation();
  const [geo, setGeo] = useState<{ name: string; flag: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = sessionStorage.getItem('visitor-geo');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.name && parsed?.flag) {
          setGeo(parsed);
          return;
        }
      } catch {}
    }
    supabase.functions.invoke('geo-detect').then(({ data }) => {
      if (cancelled || !data) return;
      const result = { name: data.country_name, flag: data.flag };
      setGeo(result);
      sessionStorage.setItem('visitor-geo', JSON.stringify(result));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const display = geo || fallbackByLang[i18n.language] || fallbackByLang.en;

  return (
    <section className="bg-white py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm sm:text-base text-foreground/70 mb-4 sm:mb-6">
          {t('reviewsStrip.headline', { defaultValue: 'Trusted by pizzerias in' })}{' '}
          <span className="font-semibold text-foreground">
            {display.flag} {display.name}
          </span>
        </p>
        <Carousel className="w-full max-w-4xl mx-auto" opts={{ loop: true }} plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}>
          <CarouselContent>
            {clients.map((client) => (
              <CarouselItem key={client.name} className="md:basis-1/3">
                <div className="flex flex-col items-center text-center px-4 py-2">
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="h-10 sm:h-14 w-auto mb-3 opacity-80"
                  />
                  <div className="flex gap-0.5 mb-2 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground/80 text-xs sm:text-sm italic leading-snug max-w-xs">
                    "{t(`hero.review${client.reviewKey}`)}"
                  </p>
                  <p className="text-muted-foreground text-[10px] sm:text-xs mt-2 font-semibold">
                    — {client.name}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default ReviewsStrip;
