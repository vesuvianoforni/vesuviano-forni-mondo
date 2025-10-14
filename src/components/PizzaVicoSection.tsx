import { useTranslation } from 'react-i18next';

const PizzaVicoSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-stone-900 mb-4">
              {t('pizzaVico.title')}
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto">
              {t('pizzaVico.description')}
            </p>
          </div>

          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
            <img 
              src="/lovable-uploads/pizza-vico-event.png" 
              alt="Pizza a Vico - Forni Vesuviano"
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Bottom Text */}
          <div className="text-center mt-8">
            <p className="text-base text-stone-600 italic">
              {t('pizzaVico.caption')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PizzaVicoSection;
