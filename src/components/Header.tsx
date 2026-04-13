
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Menu, ChevronDown } from "lucide-react";
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

  const getOvenPath = (ovenType: string) => {
    const paths: Record<string, Record<string, string>> = {
      'traditional': {
        'it': '/it/forni-tradizionali',
        'en': '/en/traditional-ovens',
        'fr': '/fr/fours-traditionnels',
        'es': '/es/hornos-tradicionales',
        'de': '/de/traditionelle-oefen'
      },
      'gas': {
        'it': '/it/forni-gas',
        'en': '/en/gas-ovens',
        'fr': '/fr/fours-gaz',
        'es': '/es/hornos-gas',
        'de': '/de/gasoefen'
      },
      'electric': {
        'it': '/it/forni-elettrici',
        'en': '/en/electric-ovens',
        'fr': '/fr/fours-electriques',
        'es': '/es/hornos-electricos',
        'de': '/de/elektrooefen'
      },
      'rotating': {
        'it': '/it/forni-rotanti',
        'en': '/en/rotating-ovens',
        'fr': '/fr/fours-rotatifs',
        'es': '/es/hornos-rotativos',
        'de': '/de/drehoefen'
      },
      'burners': {
        'it': '/it/bruciatori',
        'en': '/en/burners',
        'fr': '/fr/bruleurs',
        'es': '/es/quemadores',
        'de': '/de/brenner'
      },
      'smokePurifier': {
        'it': '/it/depuratore-fumi',
        'en': '/en/wood-smoke-purifier',
        'fr': '/fr/purificateur-fumee',
        'es': '/es/purificador-humo',
        'de': '/de/rauchfilter'
      }
    };
    return paths[ovenType]?.[currentLang] || paths[ovenType]?.['it'] || '/';
  };

  const getReadyToShipPath = () => {
    const paths: Record<string, string> = {
      'it': '/it/pronta-consegna',
      'en': '/en/ready-to-ship',
      'fr': '/fr/pret-a-expedier',
      'es': '/es/listo-para-enviar',
      'de': '/de/sofort-lieferbar'
    };
    return paths[currentLang] || paths['it'];
  };

  const productDropdownItems = [
    { key: 'traditional', label: t('products.traditional.title'), path: getOvenPath('traditional') },
    { key: 'gas', label: t('products.gas.title'), path: getOvenPath('gas') },
    { key: 'electric', label: t('products.electric.title'), path: getOvenPath('electric') },
    { key: 'rotating', label: t('products.rotating.title'), path: getOvenPath('rotating') },
    { key: 'vesuviobuono', label: t('products.vesuviobuono.title'), path: getVesuvioBuonoPath() },
    { key: 'builtOnPlace', label: t('products.builtOnPlace.title'), path: '/built-on-place' },
    { key: 'burners', label: t('burners.pageTitle'), path: getOvenPath('burners') },
    { key: 'smokePurifier', label: t('zapper.menuTitle', 'Wood Smoke Purifier'), path: getOvenPath('smokePurifier') },
    { key: 'readyToShip', label: t('readyToShip.menuTitle', 'Ready to Ship'), path: getReadyToShipPath() }
  ];

  const navItems: Array<{ href: string; label: string; type: 'anchor' | 'link' }> = [
    { href: "#ai-architect", label: "Architetto AI", type: 'anchor' },
    { href: "#oven-gallery", label: t('header.gallery'), type: 'anchor' },
    { href: "#rivestimenti", label: "Rivestimenti", type: 'anchor' },
    { href: "#clients-map", label: "Clienti", type: 'anchor' },
    { href: `/${currentLang}/blog`, label: "Blog", type: 'link' },
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
    
    // Force all lazy sections to render
    window.dispatchEvent(new CustomEvent('force-lazy-load', { detail: sectionId }));
    
    if (location.pathname !== homePath) {
      navigate(homePath);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('force-lazy-load', { detail: sectionId }));
        scrollToSectionWithRetry(sectionId);
      }, 200);
    } else {
      scrollToSectionWithRetry(sectionId);
    }
    
    setIsOpen(false);
  };

  const scrollToSectionWithRetry = (sectionId: string, attempts = 0) => {
    const element = document.getElementById(sectionId);
    if (element) {
      scrollToSection(sectionId);
    } else if (attempts < 10) {
      setTimeout(() => scrollToSectionWithRetry(sectionId, attempts + 1), 100);
    }
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
            {/* Products Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="text-stone-700 hover:text-vesuviano-600 transition-colors font-medium text-sm xl:text-base relative after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-vesuviano-600 after:transition-all after:duration-300 hover:after:w-full flex items-center gap-1">
                {t('header.products')}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-stone-200 shadow-lg z-[100] min-w-[200px]">
                {productDropdownItems.map((product) => (
                  <DropdownMenuItem 
                    key={product.key}
                    className="cursor-pointer hover:bg-vesuviano-50 focus:bg-vesuviano-50"
                    onClick={() => navigate(product.path)}
                  >
                    {product.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

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
                <nav className="flex flex-col space-y-4 mt-6">
                  {/* Products Collapsible */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-medium text-stone-700 hover:text-vesuviano-600 transition-colors py-2">
                      {t('header.products')}
                      <ChevronDown className="h-5 w-5" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 mt-2 space-y-2">
                      {productDropdownItems.map((product) => (
                        <a
                          key={product.key}
                          href={product.path}
                          className="block text-base font-normal text-stone-600 hover:text-vesuviano-600 transition-colors py-2"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(product.path);
                            setIsOpen(false);
                          }}
                        >
                          {product.label}
                        </a>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

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
