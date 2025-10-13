import { useTranslation } from 'react-i18next';
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
  const [selectedProduct, setSelectedProduct] = useState<{ name: string; code: string; diameter: string; coating: string } | null>(null);

  const products = [
    {
      id: 1,
      code: "FPC-001",
      name: "Forno Pronta Consegna Mosaico Argentato",
      image: "/lovable-uploads/forno-pronta-consegna-1.png",
      diameter: "120 cm",
      fuel: t('readyToShip.woodOrGas'),
      coating: "Mosaico Argentato/Grigio",
      features: [
        t('readyToShip.features.professional'),
        t('readyToShip.features.immediate'),
        t('readyToShip.features.warranty'),
        t('readyToShip.features.certifications')
      ],
      price: t('readyToShip.contactForPrice')
    },
    {
      id: 2,
      code: "FPC-002",
      name: "Forno Pronta Consegna Mosaico Azzurro/Nero",
      image: "/lovable-uploads/forno-pronta-consegna-2.png",
      diameter: "130 cm",
      fuel: t('readyToShip.woodOrGas'),
      coating: "Mosaico Azzurro/Nero",
      features: [
        t('readyToShip.features.professional'),
        t('readyToShip.features.immediate'),
        t('readyToShip.features.warranty'),
        t('readyToShip.features.certifications')
      ],
      price: t('readyToShip.contactForPrice')
    },
    {
      id: 3,
      code: "FPC-003",
      name: "Forno Pronta Consegna Mosaico Azzurro",
      image: "/lovable-uploads/forno-pronta-consegna-3.png",
      diameter: "120 cm",
      fuel: t('readyToShip.woodOrGas'),
      coating: "Mosaico Azzurro",
      features: [
        t('readyToShip.features.professional'),
        t('readyToShip.features.immediate'),
        t('readyToShip.features.warranty'),
        t('readyToShip.features.certifications')
      ],
      price: t('readyToShip.contactForPrice')
    },
    {
      id: 4,
      code: "FPC-004",
      name: "Forno Pronta Consegna Mosaico Azzurro/Oro",
      image: "/lovable-uploads/forno-pronta-consegna-4.png",
      diameter: "100 cm",
      fuel: t('readyToShip.woodOrGas'),
      coating: "Mosaico Azzurro/Oro",
      features: [
        t('readyToShip.features.professional'),
        t('readyToShip.features.immediate'),
        t('readyToShip.features.warranty'),
        t('readyToShip.features.certifications')
      ],
      price: t('readyToShip.contactForPrice')
    },
    {
      id: 5,
      code: "FPC-005",
      name: "Forno Pronta Consegna Mosaico Bianco",
      image: "/lovable-uploads/forno-pronta-consegna-5.png",
      diameter: "120 cm",
      fuel: t('readyToShip.woodOrGas'),
      coating: "Mosaico Bianco",
      features: [
        t('readyToShip.features.professional'),
        t('readyToShip.features.immediate'),
        t('readyToShip.features.warranty'),
        t('readyToShip.features.certifications')
      ],
      price: t('readyToShip.contactForPrice'),
      sold: true
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
                {product.sold && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <div className="relative">
                      <h2 className="text-5xl font-bold text-white font-playfair">
                        SOLD - VENDUTO
                      </h2>
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-red-600 transform -rotate-12"></div>
                    </div>
                  </div>
                )}
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
                {/* Product Code Badge */}
                <div className="mb-4">
                  <span className="inline-block bg-vesuviano-100 text-vesuviano-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {t('readyToShip.productCode')}: {product.code}
                  </span>
                </div>

                {/* Main Specs */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-start">
                    <span className="font-semibold text-stone-900 min-w-[120px]">{t('readyToShip.diameter')}:</span>
                    <span className="text-stone-700">{product.diameter}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-stone-900 min-w-[120px]">{t('readyToShip.fuel')}:</span>
                    <span className="text-stone-700">{product.fuel}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-stone-900 min-w-[120px]">{t('readyToShip.coating')}:</span>
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
                    code: product.code,
                    diameter: product.diameter, 
                    coating: product.coating 
                  })}
                >
                  {t('readyToShip.requestInfo')}
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
        productCode={selectedProduct?.code || ''}
        productDiameter={selectedProduct?.diameter || ''}
        productCoating={selectedProduct?.coating || ''}
      />

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-stone-400">
            © {new Date().getFullYear()} Vesuviano - {t('footer.rights')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ReadyToShip;
