
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
import Gallery from "@/components/Gallery";
import ConsultationForm from "@/components/ConsultationForm";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <ProductCategories />
      <OvenVisualizer />
      
      <CraftsmanshipSection />
      <Services />
      <Rivestimenti />
      <VesuvioBuono />
      <ClientsMap />
      <Gallery />
      <ConsultationForm />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/lovable-uploads/83490d78-6935-41ab-bb12-49e6070f44db.png" 
                  alt="Vesuviano Logo" 
                  className="h-8 w-auto mr-3"
                />
                <h3 className="font-playfair text-2xl font-bold">Vesuviano</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Eccellenza artigianale napoletana che conquista il mondo. 
                Forni tradizionali e innovativi per ogni esigenza.
              </p>
              <div className="text-sm text-gray-500">
                Made with passion in Napoli, Italia 🇮🇹
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Prodotti</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Forni a Legna</li>
                <li>Forni a Gas</li>
                <li>Forni Elettrici</li>
                <li>Soluzioni Rotanti</li>
                <li>VesuvioBuono</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Servizi</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Consulenza Tecnica</li>
                <li>Rendering 3D</li>
                <li>Logistica Internazionale</li>
                <li>Assistenza Post-Vendita</li>
                <li>Formazione Uso Forni</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 Vesuviano. Tutti i diritti riservati. | Privacy Policy | Termini di Servizio</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
