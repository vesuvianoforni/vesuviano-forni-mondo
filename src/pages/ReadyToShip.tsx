import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import WhatsAppButton from '@/components/WhatsAppButton';
import ContactBar from '@/components/ContactBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ImageZoomModal from '@/components/ImageZoomModal';
import ReadyToShipContactModal from '@/components/ReadyToShipContactModal';
import { useState } from 'react';

const ReadyToShip = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{ name: string; diameter: string; coating: string } | null>(null);

  const products = [
    {
      id: 1,
      name: "Forno Pronta Consegna Mosaico Argentato",
      image: "/lovable-uploads/forno-pronta-consegna-1.png",
      diameter: "120 cm",
      fuel: "Legna (configurabile a Gas)",
      coating: "Mosaico Argentato/Grigio",
      features: [
        "Camera di cottura professionale",
        "Pronto per la spedizione immediata",
        "Garanzia inclusa",
        "Certificazioni CE"
      ],
      price: "Contattaci per il prezzo"
    },
    {
      id: 2,
      name: "Forno Pronta Consegna Mosaico Azzurro/Nero",
      image: "/lovable-uploads/forno-pronta-consegna-2.png",
      diameter: "130 cm",
      fuel: "Legna (configurabile a Gas)",
      coating: "Mosaico Azzurro/Nero",
      features: [
        "Camera di cottura professionale",
        "Pronto per la spedizione immediata",
        "Garanzia inclusa",
        "Certificazioni CE"
      ],
      price: "Contattaci per il prezzo"
    },
    {
      id: 3,
      name: "Forno Pronta Consegna Mosaico Azzurro",
      image: "/lovable-uploads/forno-pronta-consegna-3.png",
      diameter: "120 cm",
      fuel: "Legna (configurabile a Gas)",
      coating: "Mosaico Azzurro",
      features: [
        "Camera di cottura professionale",
        "Pronto per la spedizione immediata",
        "Garanzia inclusa",
        "Certificazioni CE"
      ],
      price: "Contattaci per il prezzo"
    },
    {
      id: 4,
      name: "Forno Pronta Consegna Mosaico Azzurro/Oro",
      image: "/lovable-uploads/forno-pronta-consegna-4.png",
      diameter: "100 cm",
      fuel: "Legna (configurabile a Gas)",
      coating: "Mosaico Azzurro/Oro",
      features: [
        "Camera di cottura professionale",
        "Pronto per la spedizione immediata",
        "Garanzia inclusa",
        "Certificazioni CE"
      ],
      price: "Contattaci per il prezzo"
    },
    {
      id: 5,
      name: "Forno Pronta Consegna Mosaico Bianco",
      image: "/lovable-uploads/forno-pronta-consegna-5.png",
      diameter: "120 cm",
      fuel: "Legna (configurabile a Gas)",
      coating: "Mosaico Bianco",
      features: [
        "Camera di cottura professionale",
        "Pronto per la spedizione immediata",
        "Garanzia inclusa",
        "Certificazioni CE"
      ],
      price: "Contattaci per il prezzo"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <Header />
      <WhatsAppButton />
      <ContactBar />
      
      <main className="container mx-auto px-4 py-24">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-bold text-stone-900 mb-4">
            {t('readyToShip.hero.title')}
          </h1>
          <p className="text-xl sm:text-2xl text-vesuviano-600 font-semibold mb-6">
            {t('readyToShip.hero.subtitle')}
          </p>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-stone-700 mb-4">
              {t('readyToShip.hero.description1')}
            </p>
            <p className="text-lg text-stone-700">
              {t('readyToShip.hero.description2')}
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-stone-200 hover:border-vesuviano-300">
              <div className="relative h-80 overflow-hidden cursor-pointer" onClick={() => setSelectedImage({ url: product.image, name: product.name })}>
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <svg className="w-8 h-8 text-vesuviano-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 text-white pointer-events-none">
                  <h3 className="font-playfair text-2xl font-bold mb-1">{product.name}</h3>
                </div>
              </div>
              
              <CardContent className="p-6">
                {/* Main Specs */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-start">
                    <span className="font-semibold text-stone-900 min-w-[120px]">Diametro interno:</span>
                    <span className="text-stone-700">{product.diameter}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-stone-900 min-w-[120px]">Alimentazione:</span>
                    <span className="text-stone-700">{product.fuel}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-stone-900 min-w-[120px]">Rivestimento:</span>
                    <span className="text-stone-700">{product.coating}</span>
                  </div>
                </div>

                {/* Additional Features */}
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, index) => (
                    <li 
                      key={index}
                      className="flex items-center text-sm text-stone-600"
                    >
                      <div className="w-1.5 h-1.5 bg-vesuviano-500 rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mb-4">
                  <p className="text-xl font-bold text-vesuviano-600">{product.price}</p>
                </div>

                <Button
                  className="w-full bg-vesuviano-600 hover:bg-vesuviano-700 text-white transition-all duration-300"
                  onClick={() => setSelectedProduct({ 
                    name: product.name, 
                    diameter: product.diameter, 
                    coating: product.coating 
                  })}
                >
                  Richiedi Informazioni
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ''}
        imageAlt={selectedImage?.name || ''}
        title={selectedImage?.name}
      />

      {/* Contact Modal */}
      <ReadyToShipContactModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        productName={selectedProduct?.name || ''}
        productDiameter={selectedProduct?.diameter || ''}
        productCoating={selectedProduct?.coating || ''}
      />

      {/* Footer */}
      <footer className="bg-charcoal-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <h3 className="font-playfair text-xl font-bold mb-4">Vesuviano</h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-4">
                Forni artigianali napoletani dal 1932. Tradizione, qualità e innovazione per la perfetta pizza napoletana.
              </p>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/vesuvianoforniapietra" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-vesuviano-500 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/vesuvianoforniapietra" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-vesuviano-500 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-playfair text-lg font-semibold mb-4">Link Rapidi</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/it" className="text-stone-400 hover:text-vesuviano-400 transition-colors">Home</Link></li>
                <li><Link to="/it/forni-tradizionali" className="text-stone-400 hover:text-vesuviano-400 transition-colors">Forni Tradizionali</Link></li>
                <li><Link to="/it/forni-a-gas" className="text-stone-400 hover:text-vesuviano-400 transition-colors">Forni a Gas</Link></li>
                <li><Link to="/it/forni-elettrici" className="text-stone-400 hover:text-vesuviano-400 transition-colors">Forni Elettrici</Link></li>
                <li><Link to="/it/forni-rotanti" className="text-stone-400 hover:text-vesuviano-400 transition-colors">Forni Rotanti</Link></li>
                <li><Link to="/it/vesuviobuono" className="text-stone-400 hover:text-vesuviano-400 transition-colors">VesuvioBuono</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-playfair text-lg font-semibold mb-4">Servizi</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/it/architetto-ai" className="text-stone-400 hover:text-vesuviano-400 transition-colors">Architetto AI</Link></li>
                <li><Link to="/it/pronta-consegna" className="text-stone-400 hover:text-vesuviano-400 transition-colors">Pronta Consegna</Link></li>
                <li><span className="text-stone-400">Consulenza Personalizzata</span></li>
                <li><span className="text-stone-400">Installazione</span></li>
                <li><span className="text-stone-400">Assistenza Post-Vendita</span></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-playfair text-lg font-semibold mb-4">Contatti</h3>
              <ul className="space-y-3 text-sm text-stone-400">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Via Bosco, 23, 80046<br />Sant'Anastasia (NA), Italia</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+393510308686" className="hover:text-vesuviano-400 transition-colors">+39 351 030 8686</a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:info@vesuviano.it" className="hover:text-vesuviano-400 transition-colors">info@vesuviano.it</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-stone-400 text-sm text-center md:text-left">
                © {new Date().getFullYear()} Vesuviano Forni a Pietra. Tutti i diritti riservati.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-stone-400 hover:text-vesuviano-400 transition-colors">Privacy Policy</a>
                <a href="#" className="text-stone-400 hover:text-vesuviano-400 transition-colors">Cookie Policy</a>
                <a href="#" className="text-stone-400 hover:text-vesuviano-400 transition-colors">Termini e Condizioni</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ReadyToShip;
