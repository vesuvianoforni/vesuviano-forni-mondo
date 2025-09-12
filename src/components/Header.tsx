
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from 'react';

const Header = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "#products", label: t('header.products') },
    { href: "#vesuviobuono", label: t('header.vesuviobuono') },
    { href: "#gallery", label: t('header.gallery') },
    { href: "#consultation", label: t('header.consultation') }
  ];

  const handleNavClick = (href: string) => {
    document.getElementById(href.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/255a7344-f5ab-411b-8b37-6ed61e01d472.png" 
              alt="Vesuviano - Forni Vulcanici Selezionati" 
              className="h-10 sm:h-12 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <a 
                key={item.href}
                href={item.href} 
                className="text-stone-700 hover:text-vesuviano-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
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
              className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white"
              onClick={() => handleNavClick('#consultation')}
            >
              {t('header.contact')}
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
                        handleNavClick(item.href);
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                  <Button 
                    className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white w-full mt-6"
                    onClick={() => handleNavClick('#consultation')}
                  >
                    {t('header.contact')}
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
