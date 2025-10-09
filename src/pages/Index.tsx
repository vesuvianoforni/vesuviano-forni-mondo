
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Wand2, Eye, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductCategories from "@/components/ProductCategories";
import CraftsmanshipSection from "@/components/CraftsmanshipSection";
import Services from "@/components/Services";
import Rivestimenti from "@/components/Rivestimenti";
import ClientsMap from "@/components/ClientsMap";
import OvenGallery from "@/components/OvenGallery";
import OvenDataInitializer from "@/components/OvenDataInitializer";
import ConsultationForm from "@/components/ConsultationForm";
import ErrorBoundary from "@/components/ErrorBoundary";
import FAQSection from "@/components/FAQSection";

import WhatsAppButton from "@/components/WhatsAppButton";
import ContactBar from "@/components/ContactBar";

const Index = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  // Extract current language from location
  const currentLang = i18n.language;

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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    scrollToSection(sectionId);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <OvenDataInitializer />
      <Header />
      
      <main>
        <Hero />
        
        <section id="products" aria-label="Categorie prodotti">
          <ProductCategories />
        </section>
        
        {/* Ready to Ship Section */}
        <section id="ready-to-ship" aria-label="Pronta consegna" className="py-16 md:py-20 bg-gradient-to-b from-stone-100 to-stone-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-vesuviano-500 to-vesuviano-600 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 text-center text-white">
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                    <span className="animate-pulse">🔥</span>
                    <span>{t('hero.readyToShip.subtitle')}</span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold mb-4">
                    {t('hero.readyToShip.title')}
                  </h2>
                  
                  <p className="text-lg sm:text-xl text-white/90 mb-3 max-w-2xl mx-auto">
                    {t('readyToShip.hero.description1')}
                  </p>
                  
                  <p className="text-base sm:text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                    {t('readyToShip.hero.description2')}
                  </p>
                  
                  <Button 
                    size="lg"
                    className="bg-white text-vesuviano-600 hover:bg-stone-100 px-8 py-6 text-lg font-bold transition-all duration-300 hover:scale-105 shadow-xl"
                    onClick={() => navigate(`/${currentLang}/pronta-consegna`)}
                  >
                    {t('hero.readyToShip.cta')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="ai-architect" aria-label="Architetto AI" className="py-16 md:py-24 bg-gradient-to-b from-stone-50 to-stone-100">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
                <span>{t('ovenVisualizer.badge')}</span>
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
                {t('ovenVisualizer.title')}
              </h2>
              <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-12">
                {t('ovenVisualizer.subtitle')}
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
              {/* AI Mode Preview */}
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-2">
                  {t('ovenVisualizer.aiMode.title')}
                </h3>
                <p className="text-stone-600 text-sm mb-4">
                  {t('ovenVisualizer.aiMode.description')}
                </p>
                <div className="space-y-2 text-xs text-stone-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{t('ovenVisualizer.aiMode.features.photorealistic')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{t('ovenVisualizer.aiMode.features.lighting')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{t('ovenVisualizer.aiMode.features.highRes')}</span>
                  </div>
                </div>
              </div>

              {/* AR Mode Preview */}
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-2">
                  {t('ovenVisualizer.arMode.title')}
                </h3>
                <p className="text-stone-600 text-sm mb-4">
                  {t('ovenVisualizer.arMode.description')}
                </p>
                <div className="space-y-2 text-xs text-stone-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{t('ovenVisualizer.arMode.features.interactive')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{t('ovenVisualizer.arMode.features.realtime')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{t('ovenVisualizer.arMode.features.compatible')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button 
                onClick={() => navigate(`/${currentLang}/architettoai`)}
                size="lg"
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {t('ovenVisualizer.cta.start')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
        
        <section id="craftsmanship" aria-label="Artigianato napoletano">
          <CraftsmanshipSection />
        </section>
        
        <section id="services" aria-label="Servizi offerti">
          <Services />
        </section>
        
        <section id="rivestimenti" aria-label="Rivestimenti forni">
          <Rivestimenti />
        </section>
        
        <section id="clients-map" aria-label="Clienti nel mondo">
          <ErrorBoundary fallback={<div className="container mx-auto px-6 py-8">Mappa temporaneamente non disponibile.</div>}>
            <ClientsMap />
          </ErrorBoundary>
        </section>
        
        <section id="oven-gallery" aria-label="Galleria forni">
          <OvenGallery />
        </section>
        
        <section id="consultation" aria-label="Modulo contatti">
          <ConsultationForm />
        </section>
        
        <section id="faq" aria-label="Domande frequenti">
          <FAQSection />
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <img 
                  src="/lovable-uploads/vesuviano-logo-bianco.png" 
                  alt="Vesuviano - Forni Vulcanici Selezionati" 
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Eccellenza artigianale napoletana che conquista il mondo. 
                Forni tradizionali e innovativi per ogni esigenza culinaria professionale.
              </p>
              <div className="text-sm text-gray-500">
                Made with passion in Napoli, Italia 🇮🇹
              </div>
            </div>
            
            {/* Navigation Links */}
            <div>
              <h4 className="font-semibold mb-4 text-vesuviano-400">Navigazione</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a 
                    href={`/${currentLang}#products`}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => handleNavClick(e, 'products')}
                  >
                    Categorie Prodotti
                  </a>
                </li>
                <li>
                  <a 
                    href={`/${currentLang}#oven-gallery`}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => handleNavClick(e, 'oven-gallery')}
                  >
                    Collezione Forni
                  </a>
                </li>
                <li>
                  <a 
                    href={`/${currentLang}#ai-architect`}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => handleNavClick(e, 'ai-architect')}
                  >
                    Architetto AI
                  </a>
                </li>
                <li>
                  <a 
                    href={`/${currentLang}#ai-architect`}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => handleNavClick(e, 'ai-architect')}
                  >
                    Realtà Aumentata
                  </a>
                </li>
                <li>
                  <Link 
                    to={getVesuvioBuonoPath()}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    VesuvioBuono
                  </Link>
                </li>
                <li>
                  <a 
                    href={`/${currentLang}#clients-map`}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => handleNavClick(e, 'clients-map')}
                  >
                    Clienti nel Mondo
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4 text-vesuviano-400">Servizi</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a 
                    href={`/${currentLang}#consultation`}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => handleNavClick(e, 'consultation')}
                  >
                    Consulenza Tecnica
                  </a>
                </li>
                <li className="text-gray-400">Rendering 3D Personalizzati</li>
                <li className="text-gray-400">Logistica Internazionale</li>
                <li className="text-gray-400">Assistenza Post-Vendita</li>
                <li className="text-gray-400">Formazione Uso Forni</li>
              </ul>
            </div>
            
            {/* Contatti */}
            <div>
              <h4 className="font-semibold mb-4 text-vesuviano-400">Contatti</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a 
                    href="mailto:info@vesuvianoforni.com" 
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span>📧</span>
                    info@vesuvianoforni.com
                  </a>
                </li>
                <li>
                  <a 
                    href="tel:+393509286941" 
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span>📞</span>
                    +39 350 928 6941
                  </a>
                </li>
                <li>
                  <a 
                    href="https://wa.me/393509286941?text=Ciao,%20vorrei%20informazioni%20sui%20vostri%20forni%20professionali" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-2 font-medium"
                  >
                    <span>💬</span>
                    Contattaci su WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-gray-500">
                &copy; 2024 Vesuviano. Tutti i diritti riservati.
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Termini di Servizio</a>
                <a 
                  href={`/${currentLang}#consultation`}
                  className="text-vesuviano-400 hover:text-vesuviano-300 transition-colors font-medium cursor-pointer"
                  onClick={(e) => handleNavClick(e, 'consultation')}
                >
                  Contattaci
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      
      {/* WhatsApp Button */}
      <WhatsAppButton />
      <ContactBar />
    </div>
  );
};

export default Index;
