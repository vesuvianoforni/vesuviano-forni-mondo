
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/83490d78-6935-41ab-bb12-49e6070f44db.png" 
              alt="Vesuviano Logo" 
              className="h-10 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="font-playfair text-xl font-bold text-charcoal-900">Vesuviano</h1>
              <p className="text-xs text-stone-600">{t('header.tagline')}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#products" className="text-stone-700 hover:text-vesuviano-600 transition-colors">{t('header.products')}</a>
            <a href="#vesuviobuono" className="text-stone-700 hover:text-vesuviano-600 transition-colors">{t('header.vesuviobuono')}</a>
            <a href="#gallery" className="text-stone-700 hover:text-vesuviano-600 transition-colors">{t('header.gallery')}</a>
            <a href="#consultation" className="text-stone-700 hover:text-vesuviano-600 transition-colors">{t('header.consultation')}</a>
          </nav>

          {/* Language Selector and CTA */}
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Button 
              className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white"
              onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('header.contact')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
