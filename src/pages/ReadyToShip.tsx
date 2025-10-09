import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import WhatsAppButton from '@/components/WhatsAppButton';
import ContactBar from '@/components/ContactBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ReadyToShip = () => {
  const { t } = useTranslation();

  const products = [
    {
      id: 1,
      name: "Forno Rotante Mosaico Argentato",
      image: "/lovable-uploads/forno-pronta-consegna-1.png",
      description: "Forno rotante professionale con rivestimento in mosaico argentato",
      features: [
        "Rivestimento mosaico argentato/grigio",
        "Camera di cottura professionale",
        "Pronto per la spedizione",
        "Garanzia inclusa"
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
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-playfair text-2xl font-bold mb-1">{product.name}</h3>
                </div>
              </div>
              
              <CardContent className="p-6">
                <p className="text-stone-600 mb-4 leading-relaxed">
                  {product.description}
                </p>
                
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
                  onClick={() => window.open('https://wa.me/393510308686', '_blank')}
                >
                  Richiedi Informazioni
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

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
