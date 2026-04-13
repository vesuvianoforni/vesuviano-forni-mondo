
import React, { lazy, Suspense } from "react";
import wiseLogo from '@/assets/wise-logo.png';
import paypalLogo from '@/assets/paypal-logo.png';
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Wand2, Eye, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductCategories from "@/components/ProductCategories";
import LazySection from "@/components/LazySection";
import ErrorBoundary from "@/components/ErrorBoundary";
import ValueProposition from "@/components/ValueProposition";

// Lazy loaded below-fold components

const Services = lazy(() => import("@/components/Services"));
const Rivestimenti = lazy(() => import("@/components/Rivestimenti"));
const ClientsMap = lazy(() => import("@/components/ClientsMap"));
const OvenGallery = lazy(() => import("@/components/OvenGallery"));
import OvenDataInitializer from "@/components/OvenDataInitializer";
const ConsultationForm = lazy(() => import("@/components/ConsultationForm"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const HomeBlogSection = lazy(() => import("@/components/HomeBlogSection"));


const AIChatWidget = lazy(() => import("@/components/chat/AIChatWidget"));

const ReadyToShipPopup = lazy(() => import("@/components/ReadyToShipPopup"));
const CallbackPopup = lazy(() => import("@/components/CallbackPopup"));

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
        
        <ValueProposition />

        <section id="products" aria-label="Categorie prodotti">
          <ProductCategories />
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
        
        
        <LazySection minHeight="400px">
          <Suspense fallback={null}>
            <section id="services" aria-label="Servizi offerti">
              <Services />
            </section>
          </Suspense>
        </LazySection>
        
        <LazySection minHeight="400px">
          <Suspense fallback={null}>
            <section id="rivestimenti" aria-label="Rivestimenti forni">
              <Rivestimenti />
            </section>
          </Suspense>
        </LazySection>

        
        
        <LazySection minHeight="500px">
          <Suspense fallback={null}>
            <section id="clients-map" aria-label="Clienti nel mondo">
              <ErrorBoundary fallback={<div className="container mx-auto px-6 py-8">Mappa temporaneamente non disponibile.</div>}>
                <ClientsMap />
              </ErrorBoundary>
            </section>
          </Suspense>
        </LazySection>
        
        <LazySection minHeight="400px">
          <Suspense fallback={null}>
            <section id="oven-gallery" aria-label="Galleria forni">
              <OvenGallery />
            </section>
          </Suspense>
        </LazySection>
        
        <LazySection minHeight="400px">
          <Suspense fallback={null}>
            <section id="consultation" aria-label="Modulo contatti">
              <ConsultationForm />
            </section>
          </Suspense>
        </LazySection>
        
        <LazySection minHeight="300px">
          <Suspense fallback={null}>
            <section id="blog" aria-label="Blog">
              <HomeBlogSection />
            </section>
          </Suspense>
        </LazySection>

        <LazySection minHeight="300px">
          <Suspense fallback={null}>
            <section id="faq" aria-label="Domande frequenti">
              <FAQSection />
            </section>
          </Suspense>
        </LazySection>
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
                  <Link 
                    to={(() => {
                      const paths: Record<string, string> = {
                        'it': '/it/pronta-consegna',
                        'en': '/en/ready-to-ship',
                        'fr': '/fr/pret-a-expedier',
                        'es': '/es/listo-para-enviar',
                        'de': '/de/versandfertig'
                      };
                      return paths[currentLang] || paths['it'];
                    })()}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {t('readyToShip.menuTitle', 'Ready to Ship')}
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
                    href="tel:+390819231684" 
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span>📞</span>
                    081 19231684
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
          
          {/* Payment Methods */}
          <div className="border-t border-gray-800 pt-8 mb-6">
            <div className="flex items-center justify-center gap-6">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Metodi di pagamento</span>
              <div className="flex items-center gap-4">
                <img src={wiseLogo} alt="Wise" loading="lazy" width={80} height={80} className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                <img src={paypalLogo} alt="PayPal" loading="lazy" width={80} height={80} className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-6">
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


      {/* AI Chat Widget */}
      <Suspense fallback={null}>
        <AIChatWidget />
        
        <ReadyToShipPopup />
        <CallbackPopup />
      </Suspense>
    </div>
  );
};

export default Index;
