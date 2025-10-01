import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import OvenVisualizer from '@/components/OvenVisualizer';
import WhatsAppButton from '@/components/WhatsAppButton';

const ArchitettoAI = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <OvenVisualizer />
      <WhatsAppButton />
      
      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">{t('footer.company')}</h3>
              <p className="text-sm leading-relaxed">
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link></li>
                <li><Link to="/#products" className="hover:text-white transition-colors">{t('nav.products')}</Link></li>
                <li><Link to="/#craftsmanship" className="hover:text-white transition-colors">{t('nav.craftsmanship')}</Link></li>
                <li><Link to="/#gallery" className="hover:text-white transition-colors">{t('nav.gallery')}</Link></li>
                <li><Link to="/#contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">{t('footer.contact')}</h3>
              <ul className="space-y-2 text-sm">
                <li>{t('footer.address')}: Sant'Anastasia (NA)</li>
                <li>{t('footer.phone')}: +39 081 530 2714</li>
                <li>Email: info@vesuviano.it</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Vesuviano. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArchitettoAI;
