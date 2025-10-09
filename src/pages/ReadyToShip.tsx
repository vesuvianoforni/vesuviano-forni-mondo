import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import WhatsAppButton from '@/components/WhatsAppButton';
import ContactBar from '@/components/ContactBar';

const ReadyToShip = () => {
  const { t } = useTranslation();

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

        {/* Products Grid - Placeholder for now */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Product cards will be added here when you upload the photos */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center border-2 border-dashed border-stone-300">
            <p className="text-stone-500 text-lg">
              {t('readyToShip.productsPlaceholder')}
            </p>
          </div>
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
