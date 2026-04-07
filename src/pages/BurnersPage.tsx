import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import ConsultationForm from '@/components/ConsultationForm';
import AIChatWidget from '@/components/chat/AIChatWidget';
import ContactBar from '@/components/ContactBar';
import { Button } from '@/components/ui/button';
import CtaButton from '@/components/CtaButton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Gauge, Settings } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface BurnersPageProps {
  lang: 'it' | 'en' | 'fr' | 'es' | 'de';
}

interface BurnerSpecs {
  series?: string;
  control?: string;
  oven_sizes?: string;
  power_kw?: number;
  power_kcal?: number;
  lpg_consumption?: string;
  methane_consumption?: string;
  compatible_ovens?: string;
}

const BurnersPage = ({ lang }: BurnersPageProps) => {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.title = `${t('burners.pageTitle')} - Vesuviano`;
  }, [lang, i18n, t]);

  const { data: burners, isLoading } = useQuery({
    queryKey: ['public-burners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('burners')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const getSpecs = (specs: Json | null): BurnerSpecs => {
    if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return {};
    return specs as unknown as BurnerSpecs;
  };

  const getSeriesIcon = (series?: string) => {
    switch (series) {
      case 'P': return <Flame className="h-5 w-5" />;
      case 'D': return <Settings className="h-5 w-5" />;
      default: return <Gauge className="h-5 w-5" />;
    }
  };

  const getSeriesColor = (series?: string) => {
    switch (series) {
      case 'P': return 'bg-orange-100 text-orange-700';
      case 'D': return 'bg-blue-100 text-blue-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-stone-900">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-vesuviano-500/15 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-vesuviano-400/10 rounded-full blur-[150px]"></div>
        </div>
        <div className="relative container mx-auto px-6">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-vesuviano-500/20 text-vesuviano-300 border-vesuviano-500/30 text-sm">
              {t('burners.badge')}
            </Badge>
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              {t('burners.heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl text-stone-300 mb-8 max-w-2xl">
              {t('burners.heroSubtitle')}
            </p>
            <CtaButton dark className="px-8 py-6 text-lg" />
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-6">
            {t('burners.introTitle')}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('burners.introText')}
          </p>
        </div>
      </section>

      {/* Series Overview */}
      <section className="py-12 bg-stone-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            {['P', 'D'].map((series) => (
              <Card key={series} className="border-stone-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${getSeriesColor(series)}`}>
                    {getSeriesIcon(series)}
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-foreground mb-2">
                    {t(`burners.series.${series}.title`)}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(`burners.series.${series}.description`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Burners Catalog */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            {t('burners.catalogTitle')}
          </h2>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-stone-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {burners?.map((burner) => {
                const specs = getSpecs(burner.specifications);
                return (
                  <Card key={burner.id} className="overflow-hidden border-stone-200 hover:shadow-xl transition-all duration-300 group">
                    <div className="relative h-56 bg-stone-100 overflow-hidden">
                      {burner.image_url ? (
                        <img
                          src={burner.image_url}
                          alt={burner.name}
                          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Flame className="h-16 w-16 text-stone-300" />
                        </div>
                      )}
                      {specs.series && (
                        <Badge className={`absolute top-3 right-3 ${getSeriesColor(specs.series)}`}>
                          {t('burners.seriesLabel')} {specs.series}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-playfair text-xl font-bold text-foreground mb-2">
                        {burner.name}
                      </h3>
                      {burner.description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {burner.description}
                        </p>
                      )}
                      <div className="space-y-2 text-sm">
                        {specs.control && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('burners.specs.control')}</span>
                            <span className="font-medium text-foreground">{specs.control}</span>
                          </div>
                        )}
                        {specs.power_kw && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('burners.specs.power')}</span>
                            <span className="font-medium text-foreground">{specs.power_kw} kW</span>
                          </div>
                        )}
                        {specs.oven_sizes && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('burners.specs.ovenSizes')}</span>
                            <span className="font-medium text-foreground">Ø {specs.oven_sizes} cm</span>
                          </div>
                        )}
                        {specs.lpg_consumption && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('burners.specs.consumption')}</span>
                            <span className="font-medium text-foreground">{specs.lpg_consumption}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Consultation Form */}
      <section id="consultation" className="py-20 bg-stone-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('burners.ctaTitle')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('burners.ctaText')}
            </p>
          </div>
          <ConsultationForm />
        </div>
      </section>

      <AIChatWidget />
      <ContactBar />
    </div>
  );
};

export default BurnersPage;
