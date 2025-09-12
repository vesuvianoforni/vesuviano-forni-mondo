
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';

const ProductCategories = () => {
  const { t } = useTranslation();

  const categories = [
    {
      key: 'traditional',
      image: "/lovable-uploads/vesuviobuono-verde-mosaico.jpg"
    },
    {
      key: 'gas',
      image: "/lovable-uploads/forno-arancione-terra-del-gusto.png"
    },
    {
      key: 'electric',
      image: "/lovable-uploads/forno-metallo-bianco-nuovo.png"
    },
    {
      key: 'rotating',
      image: "/lovable-uploads/vesuviobuono-osteria-pizza.jpg"
    }
  ];

  return (
    <section id="products" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-4">
              {t('products.title')} <span className="text-vesuviano-600">{t('products.titleHighlight')}</span>
            </h2>
            <p className="font-inter text-lg text-stone-600 max-w-2xl mx-auto">
              {t('products.subtitle')}
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {categories.map((category, index) => (
              <Card 
                key={category.key}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border border-stone-200 hover:border-vesuviano-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={t(`products.${category.key}.title`)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-playfair text-2xl font-bold mb-1">{t(`products.${category.key}.title`)}</h3>
                    <p className="text-sm opacity-90 font-inter">{t(`products.${category.key}.subtitle`)}</p>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <p className="text-stone-600 mb-4 leading-relaxed">
                    {t(`products.${category.key}.description`)}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {Object.keys(t(`products.${category.key}.features`, { returnObjects: true }) as object).map((featureKey) => (
                      <li 
                        key={featureKey}
                        className="flex items-center text-sm text-stone-600 hover:text-vesuviano-600 transition-colors duration-300"
                      >
                        <div className="w-1.5 h-1.5 bg-vesuviano-500 rounded-full mr-3 flex-shrink-0"></div>
                        {t(`products.${category.key}.features.${featureKey}`)}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full bg-stone-100 text-stone-700 hover:bg-vesuviano-500 hover:text-white transition-all duration-300"
                    onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {t('products.learnMore')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="text-center bg-stone-50 rounded-2xl p-8 animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <h3 className="font-playfair text-3xl font-bold text-charcoal-900 mb-4">
              {t('products.customSolutions.title')}
            </h3>
            <p className="text-stone-600 mb-6 max-w-2xl mx-auto">
              {t('products.customSolutions.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-8 py-3 transition-all duration-300 hover:scale-105"
                onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('products.customSolutions.freeConsultation')}
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-vesuviano-500 text-vesuviano-600 hover:bg-vesuviano-500 hover:text-white px-8 py-3 transition-all duration-300"
                onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('products.customSolutions.viewGallery')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
