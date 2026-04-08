import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import AIChatWidget from '@/components/chat/AIChatWidget';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ImageZoomModal from '@/components/ImageZoomModal';
import ReadyToShipContactModal from '@/components/ReadyToShipContactModal';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ReadyToShipOven {
  id: string;
  model_name: string;
  custom_title: string | null;
  diameter: number;
  coating: string | null;
  fuel_type: string | null;
  description: string | null;
  list_price: number;
  sale_price: number | null;
  images: string[];
  is_sold: boolean;
}

const ReadyToShip = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ReadyToShipOven | null>(null);
  const [products, setProducts] = useState<ReadyToShipOven[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('ready_to_ship_ovens')
        .select('*')
        .order('is_sold', { ascending: true })
        .order('created_at', { ascending: false });
      setProducts((data as ReadyToShipOven[]) || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);




  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <Header />
      <AIChatWidget />
      
      
      <main className="container mx-auto px-4 py-24">
        <section className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-bold text-stone-900 mb-4">
            {t('readyToShip.hero.title')}
          </h1>
          <p className="text-xl sm:text-2xl text-vesuviano-600 font-semibold mb-6">
            {t('readyToShip.hero.subtitle')}
          </p>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-stone-700 mb-4">{t('readyToShip.hero.description1')}</p>
            <p className="text-lg text-stone-700">{t('readyToShip.hero.description2')}</p>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-vesuviano-600" />
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const mainImage = product.images?.[0] || '/placeholder.svg';
              return (
                <Card key={product.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-stone-200 hover:border-vesuviano-300">
                  <div className="relative h-80 overflow-hidden cursor-pointer" onClick={() => setSelectedImage({ url: mainImage, name: product.model_name })}>
                    <img 
                      src={mainImage} 
                      alt={product.model_name}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {product.is_sold && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <div className="relative">
                          <h2 className="text-5xl font-bold text-white font-playfair">SOLD - VENDUTO</h2>
                          <div className="absolute top-1/2 left-0 right-0 h-1 bg-red-600 transform -rotate-12" />
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
                      <h3 className="font-playfair text-2xl font-bold mb-1">{product.model_name}</h3>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-6 space-y-3">
                      <div className="flex items-start">
                        <span className="font-semibold text-stone-900 min-w-[120px]">{t('readyToShip.diameter')}:</span>
                        <span className="text-stone-700">{product.diameter} cm</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-semibold text-stone-900 min-w-[120px]">{t('readyToShip.fuel')}:</span>
                        <span className="text-stone-700">{product.fuel_type || t('readyToShip.woodOrGas')}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-semibold text-stone-900 min-w-[120px]">{t('readyToShip.coating')}:</span>
                        <span className="text-stone-700">{product.coating || 'Standard'}</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {[
                        t('readyToShip.features.professional'),
                        t('readyToShip.features.immediate'),
                        t('readyToShip.features.warranty'),
                        t('readyToShip.features.certifications')
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-stone-600">
                          <div className="w-1.5 h-1.5 bg-vesuviano-500 rounded-full mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {!product.is_sold ? (
                      <Button
                        className="w-full bg-vesuviano-600 hover:bg-vesuviano-700 text-white transition-all duration-300"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {t('readyToShip.requestInfo')}
                      </Button>
                    ) : (
                      <Button disabled className="w-full opacity-50">
                        VENDUTO
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}
      </main>

      <ImageZoomModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ''}
        imageAlt={selectedImage?.name || ''}
        title={selectedImage?.name}
      />

      <ReadyToShipContactModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        productName={selectedProduct?.model_name || ''}
        productCode={selectedProduct?.id || ''}
        productDiameter={`${selectedProduct?.diameter || ''} cm`}
        productCoating={selectedProduct?.coating || ''}
        productId={selectedProduct?.id}
        productPrice={selectedProduct?.sale_price || selectedProduct?.list_price}
      />

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
