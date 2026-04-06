import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';

const ReadyToShipPopup = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
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
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-vesuviano-500 to-vesuviano-600 border-none text-white p-0 overflow-hidden">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-white z-50">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 p-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="animate-pulse">🔥</span>
            <span>{t('hero.readyToShip.subtitle')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-playfair font-bold mb-3">
            {t('hero.readyToShip.title')}
          </h2>

          <p className="text-white/90 mb-2 text-sm sm:text-base">
            {t('readyToShip.hero.description1')}
          </p>

          <p className="text-white font-semibold mb-1 text-base sm:text-lg">
            Disponibili anche a Gas
          </p>

          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <span className="text-xl font-bold">Sconto 20%</span>
          </div>

          <Button
            onClick={handleNavigate}
            size="lg"
            className="bg-white text-vesuviano-600 hover:bg-stone-100 px-6 py-6 text-base font-bold transition-all duration-300 hover:scale-105 shadow-xl w-full sm:w-auto"
          >
            {t('hero.readyToShip.cta')}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReadyToShipPopup;
