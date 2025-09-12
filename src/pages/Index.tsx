
import React from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductCategories from "@/components/ProductCategories";
import OvenVisualizer from "@/components/OvenVisualizer";
import CraftsmanshipSection from "@/components/CraftsmanshipSection";
import Services from "@/components/Services";
import Rivestimenti from "@/components/Rivestimenti";
import VesuvioBuono from "@/components/VesuvioBuono";
import ClientsMap from "@/components/ClientsMap";
import OvenGallery from "@/components/OvenGallery";
import OvenDataInitializer from "@/components/OvenDataInitializer";
import ConsultationForm from "@/components/ConsultationForm";

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <OvenDataInitializer />
      <Header />
      <Hero />
      <ProductCategories />
      <OvenVisualizer />
      
      <CraftsmanshipSection />
      <Services />
      <Rivestimenti />
      <VesuvioBuono />
      <ClientsMap />
      <OvenGallery />
      <ConsultationForm />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
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
                    href="#rivestimenti" 
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('rivestimenti')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Rivestimenti
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
                <li className="text-gray-400">Architetto AI</li>
                <li className="text-gray-400">Realtà Aumentata</li>
                <li className="text-gray-400">Rendering 3D Personalizzati</li>
                <li className="text-gray-400">Logistica Internazionale</li>
                <li className="text-gray-400">Assistenza Post-Vendita</li>
                <li className="text-gray-400">Formazione Uso Forni</li>
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
    </div>
  );
};

export default Index;
