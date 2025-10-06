
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from 'react';
import LazyImage from './LazyImage';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Extract current language from path
  const getCurrentLang = () => {
    const match = location.pathname.match(/^\/(it|en|fr|de|es)/);
    return match ? match[1] : i18n.language;
  };
  
  const currentLang = getCurrentLang();

  const getVesuvioBuonoPath = () => {
    const paths: Record<string, string> = {
      'it': '/it/sistema-vesuviobuono',
      'en': '/en/vesuviobuono-system',
      'fr': '/fr/systeme-vesuviobuono',
      'es': '/es/sistema-vesuviobuono',
      'de': '/de/vesuviobuono-system'
    };
    return paths[currentLang] || paths['it'];
  };

  const navItems: Array<{ href: string; label: string; type: 'anchor' | 'link' }> = [
    { href: "#products", label: t('header.products'), type: 'anchor' },
    { href: "#ai-architect", label: "Architetto AI", type: 'anchor' },
    { href: "#oven-gallery", label: t('header.gallery'), type: 'anchor' },
    { href: "#rivestimenti", label: "Rivestimenti", type: 'anchor' },
    { href: getVesuvioBuonoPath(), label: t('header.vesuviobuono'), type: 'link' },
    { href: "#clients-map", label: "Clienti", type: 'anchor' },
    { href: "#consultation", label: t('header.contact'), type: 'anchor' }
  ];

  const handleNavClick = (href: string, type: 'anchor' | 'link' = 'anchor') => {
    if (type === 'link') {
      navigate(href);
      setIsOpen(false);
      return;
    }
    
    const sectionId = href.replace('#', '');
    const homePath = `/${currentLang}`;
    
    // Se siamo su una pagina diversa dalla home localizzata, naviga prima alla home
    if (location.pathname !== homePath) {
      navigate(homePath);
      // Aspetta che la navigazione sia completa prima di scrollare
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    } else {
      scrollToSection(sectionId);
    }
    
    setIsOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Altezza header fisso
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleLogoClick = () => {
    const homePath = `/${currentLang}`;
    if (location.pathname !== homePath) {
      navigate(homePath);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
            <LazyImage 
              src="/lovable-uploads/255a7344-f5ab-411b-8b37-6ed61e01d472.png" 
              alt="Vesuviano - Forni artigianali napoletani, produttori di forni a legna e a zero emissioni" 
              className="h-10 sm:h-12 w-auto hover:scale-105 transition-transform duration-300"
              priority={true}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <a 
                key={item.href}
                href={item.href} 
                className="text-stone-700 hover:text-vesuviano-600 transition-colors font-medium text-sm xl:text-base relative after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-vesuviano-600 after:transition-all after:duration-300 hover:after:w-full"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href, item.type);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />
            <Button 
              className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => handleNavClick('#consultation')}
            >
              {t('header.consultation')}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSelector />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <nav className="flex flex-col space-y-6 mt-6">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="text-lg font-medium text-stone-700 hover:text-vesuviano-600 transition-colors py-2"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.href, item.type);
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                  <Button 
                    className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white w-full mt-6"
                    onClick={() => handleNavClick('#consultation')}
                  >
                    {t('header.consultation')}
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
