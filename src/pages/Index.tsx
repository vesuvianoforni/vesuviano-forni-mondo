
import React, { lazy, Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductCategories from "@/components/ProductCategories";
import CraftsmanshipSection from "@/components/CraftsmanshipSection";
import Services from "@/components/Services";
import Rivestimenti from "@/components/Rivestimenti";
import VesuvioBuono from "@/components/VesuvioBuono";
import OvenDataInitializer from "@/components/OvenDataInitializer";
import ConsultationForm from "@/components/ConsultationForm";
import ErrorBoundary from "@/components/ErrorBoundary";
import LazySection from "@/components/LazySection";
import WhatsAppButton from "@/components/WhatsAppButton";

// Lazy load heavy components
const OvenVisualizer = lazy(() => import("@/components/OvenVisualizer"));
const ClientsMap = lazy(() => import("@/components/ClientsMap"));
const OvenGallery = lazy(() => import("@/components/OvenGallery"));

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <OvenDataInitializer />
      <Header />
      
      <main>
        <Hero />
        
        <section id="products" aria-label="Categorie prodotti">
          <ProductCategories />
        </section>
        
        <LazySection 
          id="ai-architect" 
          aria-label="Visualizzatore 3D"
          minHeight="600px"
          fallback={
            <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-16">
              <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
                <div className="animate-pulse">
                  <div className="h-8 bg-stone-200 rounded w-64 mx-auto mb-4"></div>
                  <div className="h-6 bg-stone-200 rounded w-96 mx-auto mb-8"></div>
                  <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="h-48 bg-stone-200 rounded-2xl"></div>
                    <div className="h-48 bg-stone-200 rounded-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <ErrorBoundary fallback={<div className="container mx-auto px-6 py-8">Sezione AR temporaneamente non disponibile.</div>}>
            <OvenVisualizer />
          </ErrorBoundary>
        </LazySection>
        
        <section id="craftsmanship" aria-label="Artigianato napoletano">
          <CraftsmanshipSection />
        </section>
        
        <section id="services" aria-label="Servizi offerti">
          <Services />
        </section>
        
        <section id="rivestimenti" aria-label="Rivestimenti forni">
          <Rivestimenti />
        </section>
        
        <section id="vesuviobuono" aria-label="VesuvioBuono zero emissioni">
          <VesuvioBuono />
        </section>
        
        <LazySection 
          id="clients-map" 
          aria-label="Clienti nel mondo"
          minHeight="500px"
          fallback={
            <div className="py-20 bg-gradient-to-br from-gray-50 to-stone-100">
              <div className="container mx-auto px-6">
                <div className="max-w-7xl mx-auto animate-pulse">
                  <div className="text-center mb-16">
                    <div className="h-6 bg-stone-200 rounded w-32 mx-auto mb-4"></div>
                    <div className="h-8 bg-stone-200 rounded w-64 mx-auto mb-4"></div>
                    <div className="h-6 bg-stone-200 rounded w-96 mx-auto"></div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-2xl p-8 mb-12">
                    <div className="h-96 bg-stone-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <ErrorBoundary fallback={<div className="container mx-auto px-6 py-8">Mappa temporaneamente non disponibile.</div>}>
            <ClientsMap />
          </ErrorBoundary>
        </LazySection>
        
        <LazySection 
          id="oven-gallery" 
          aria-label="Galleria forni"
          minHeight="400px"
          fallback={
            <div className="py-20 bg-white">
              <div className="container mx-auto px-6 animate-pulse">
                <div className="text-center mb-16">
                  <div className="h-8 bg-stone-200 rounded w-72 mx-auto mb-6"></div>
                  <div className="h-6 bg-stone-200 rounded w-96 mx-auto mb-8"></div>
                  <div className="flex justify-center gap-4 mb-12">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-8 bg-stone-200 rounded w-24"></div>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="bg-stone-200 rounded-2xl h-64"></div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <OvenGallery />
        </LazySection>
        
        <section id="consultation" aria-label="Modulo contatti">
          <ConsultationForm />
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
                    href="#products" 
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Categorie Prodotti
                  </a>
                </li>
                <li>
                  <a 
                    href="#oven-gallery" 
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('oven-gallery')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Collezione Forni
                  </a>
                </li>
                <li>
                  <a 
                    href="#ai-architect" 
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('ai-architect')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Architetto AI
                  </a>
                </li>
                <li>
                  <a 
                    href="#ai-architect" 
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('ai-architect')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Realtà Aumentata
                  </a>
                </li>
                <li>
                  <a 
                    href="#vesuviobuono" 
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('vesuviobuono')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    VesuvioBuono
                  </a>
                </li>
                <li>
                  <a 
                    href="#clients-map" 
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('clients-map')?.scrollIntoView({ behavior: 'smooth' });
                    }}
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
                    href="#consultation" 
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' });
                    }}
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
                  href="#consultation" 
                  className="text-vesuviano-400 hover:text-vesuviano-300 transition-colors font-medium cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' });
                  }}
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
    </div>
  );
};

export default Index;
