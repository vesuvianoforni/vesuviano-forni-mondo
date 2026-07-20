
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
import { useConsultationModal } from '@/contexts/ConsultationModalContext';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { openModal } = useConsultationModal();
  
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

  const getNeapolitanPath = (): string | null => {
    const paths: Record<string, string> = {
      'en': '/en/neapolitan-pizza-ovens',
      'fr': '/fr/fours-a-pizza-napolitains',
      'es': '/es/hornos-pizza-napolitana',
      'de': '/de/neapolitanische-pizzaoefen'
    };
    return paths[currentLang] || null;
  };

  const neapolitanLabels: Record<string, string> = {
    en: 'Neapolitan Pizza Ovens',
    fr: 'Fours à Pizza Napolitains',
    es: 'Hornos Pizza Napolitana',
    de: 'Neapolitanische Pizzaöfen'
  };

  const neapolitanPath = getNeapolitanPath();

  const productDropdownItems = [
    { key: 'readyToShip', label: t('readyToShip.menuTitle', 'Ready to Ship'), path: getReadyToShipPath() },
    { key: 'builtOnPlace', label: t('products.builtOnPlace.title'), path: '/built-on-place' },
    { key: 'vesuviobuono', label: t('products.vesuviobuono.title'), path: getVesuvioBuonoPath() },
    { key: 'woodFired', label: 'Commercial Wood-Fired', path: '/en/commercial-wood-fired-pizza-oven' },
    { key: 'gasFired', label: 'Commercial Gas', path: '/en/commercial-gas-pizza-oven' },
    { key: 'rotating', label: t('products.rotating.title'), path: '/en/rotating-pizza-oven' },
    { key: 'electric', label: 'Electric Neapolitan', path: '/en/electric-pizza-oven' },
  ];


  const getCollectionsPath = () => {
    const paths: Record<string, string> = {
      it: '/it/collezioni', en: '/en/collections', fr: '/fr/collections', es: '/es/colecciones', de: '/de/kollektionen'
    };
    return paths[currentLang] || paths.it;
  };

  const getRivestimentiPath = () => {
    const paths: Record<string, string> = {
      it: '/it/rivestimenti', en: '/en/finishes', fr: '/fr/revetements', es: '/es/revestimientos', de: '/de/verkleidungen'
    };
    return paths[currentLang] || paths.it;
  };

  const getAboutPath = () => {
    const paths: Record<string, string> = {
      it: '/it/chi-siamo', en: '/en/about-us', fr: '/fr/qui-sommes-nous', es: '/es/quienes-somos', de: '/de/ueber-uns'
    };
    return paths[currentLang] || paths.it;
  };

  const aboutLabels: Record<string, string> = {
    it: 'Chi Siamo', en: 'About Us', fr: 'Qui Sommes-Nous', es: 'Quiénes Somos', de: 'Über Uns'
  };

  const getContactPath = () => {
    const paths: Record<string, string> = {
      it: '/it/contatti', en: '/en/contact', fr: '/fr/contact', es: '/es/contacto', de: '/de/kontakt'
    };
    return paths[currentLang] || paths.it;
  };

  const navItems: Array<{ href: string; label: string; type: 'anchor' | 'link' }> = [
    { href: `/${currentLang}/architettoai`, label: t('header.visualizer'), type: 'link' },
    { href: getCollectionsPath(), label: t('header.gallery'), type: 'link' },
    
    { href: getAboutPath(), label: aboutLabels[currentLang] || aboutLabels.it, type: 'link' },
    { href: `/${currentLang}/blog`, label: "Blog", type: 'link' },
    { href: getContactPath(), label: t('header.contact'), type: 'link' }
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
              src="https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/site/255a7344-f5ab-411b-8b37-6ed61e01d472.png" 
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
                <Button variant="ghost" size="sm" className="p-2" aria-label="Open menu">
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
