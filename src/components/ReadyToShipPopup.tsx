import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, ArrowRight, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface OvenPreview {
  id: string;
  custom_title: string | null;
  model_name: string;
  images: string[] | null;
  is_sold: boolean;
}

const ReadyToShipPopup = () => {
  const [open, setOpen] = useState(false);
  const [ovens, setOvens] = useState<OvenPreview[]>([]);
  const dataReady = useRef(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Prefetch data early (at 15s), well before popup opens at 25s
  useEffect(() => {
    const prefetchTimer = setTimeout(async () => {
      const { data } = await supabase
        .from('ready_to_ship_ovens')
        .select('id, custom_title, model_name, images, is_sold')
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(3);
      const fetched = (data as OvenPreview[]) || [];
      setOvens(fetched);
      dataReady.current = true;

      // Preload images so they're cached when popup opens
      fetched.forEach((oven) => {
        const url = oven.images?.[0];
        if (url) {
          const img = new Image();
          img.src = url;
        }
      });
    }, 15000);

    const openTimer = setTimeout(() => {
      setOpen(true);
    }, 25000);

    return () => {
      clearTimeout(prefetchTimer);
      clearTimeout(openTimer);
    };
  }, []);

  const handleNavigate = () => {
    const paths: Record<string, string> = {
      'it': '/it/pronta-consegna',
      'en': '/en/ready-to-ship',
      'fr': '/fr/pret-a-expedier',
      'es': '/es/listo-para-enviar',
      'de': '/de/versandfertig'
    };
    navigate(paths[currentLang] || paths['it']);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[340px] sm:max-w-md bg-gradient-to-br from-vesuviano-500 to-vesuviano-600 border-none text-white p-0 overflow-hidden rounded-2xl">
        <DialogClose className="absolute right-3 top-3 rounded-full bg-black/20 p-1 opacity-80 hover:opacity-100 transition-opacity text-white z-50">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <VisuallyHidden>
          <DialogTitle>{t('hero.readyToShip.title')}</DialogTitle>
          <DialogDescription>{t('hero.readyToShip.popupTitle')}</DialogDescription>
        </VisuallyHidden>

        {/* Decorative */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 p-5 sm:p-7">
          {/* Header */}
          <h2 className="text-lg sm:text-2xl font-playfair font-bold mb-2 leading-tight pr-6">
            {t('hero.readyToShip.popupTitle')}
          </h2>

          <div className="flex items-center gap-3 mb-1">
            <span className="bg-white/20 backdrop-blur-sm text-xs sm:text-sm font-bold px-3 py-1 rounded-full">
              -20%
            </span>
            <span className="text-white/90 text-xs sm:text-sm">
              {t('hero.readyToShip.popupDiscount')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-white/60 text-[10px] sm:text-xs mb-4">
            <Truck className="w-3 h-3" />
            <span>{t('hero.readyToShip.popupShipping')}</span>
          </div>

          {/* Oven Previews */}
          {ovens.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-hidden">
              {ovens.map((oven) => (
                <div
                  key={oven.id}
                  className="flex-1 min-w-0 rounded-lg overflow-hidden border border-white/20 cursor-pointer hover:border-white/40 transition-colors"
                  onClick={handleNavigate}
                >
                  <div className="aspect-[4/3] relative">
                    <img
                      src={oven.images?.[0] || '/placeholder.svg'}
                      alt={oven.custom_title || oven.model_name}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                      <p className="text-[9px] sm:text-[10px] font-medium text-white truncate leading-tight">
                        {oven.custom_title || oven.model_name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={handleNavigate}
            size="lg"
            className="bg-white text-vesuviano-600 hover:bg-stone-100 px-4 sm:px-6 py-5 sm:py-6 text-sm sm:text-base font-bold transition-all duration-300 hover:scale-[1.02] shadow-xl w-full"
          >
            👉 {t('hero.readyToShip.popupCta')}
            <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReadyToShipPopup;
