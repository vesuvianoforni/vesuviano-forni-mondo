import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import OvenVisualizer from '@/components/OvenVisualizer';
import WhatsAppButton from '@/components/WhatsAppButton';

const ArchitettoAI = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <div className="pt-8">
        <OvenVisualizer />
      </div>
      <WhatsAppButton />
      
      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
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
                  <Link to={`/${currentLang}#products`} className="text-gray-400 hover:text-white transition-colors">
                    Categorie Prodotti
                  </Link>
                </li>
                <li>
                  <Link to={`/${currentLang}#oven-gallery`} className="text-gray-400 hover:text-white transition-colors">
                    Collezione Forni
                  </Link>
                </li>
                <li>
                  <Link to={`/${currentLang}/architettoai`} className="text-gray-400 hover:text-white transition-colors">
                    Architetto AI
                  </Link>
                </li>
                <li>
                  <Link to={`/${currentLang}/sistema-vesuviobuono`} className="text-gray-400 hover:text-white transition-colors">
                    VesuvioBuono
                  </Link>
                </li>
                <li>
                  <Link to={`/${currentLang}#clients-map`} className="text-gray-400 hover:text-white transition-colors">
                    Clienti nel Mondo
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4 text-vesuviano-400">Servizi</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to={`/${currentLang}#consultation`} className="text-gray-400 hover:text-white transition-colors">
                    Consulenza Tecnica
                  </Link>
                </li>
                <li className="text-gray-400">Rendering 3D Personalizzati</li>
                <li className="text-gray-400">Logistica Internazionale</li>
                <li className="text-gray-400">Assistenza Post-Vendita</li>
                <li className="text-gray-400">Formazione Uso Forni</li>
              </ul>
            </div>
            
            {/* Contatti */}
            <div>
              <h4 className="font-semibold mb-4 text-vesuviano-400">Contatti</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a 
                    href="mailto:info@vesuvianoforni.com" 
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span>📧</span>
                    info@vesuvianoforni.com
                  </a>
                </li>
                <li>
                  <a 
                    href="tel:+390819231684" 
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span>📞</span>
                    081 19231684
                  </a>
                </li>
                <li>
                  <a 
                    href="https://wa.me/393509286941?text=Ciao,%20vorrei%20informazioni%20sui%20vostri%20forni%20professionali" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-2 font-medium"
                  >
                    <span>💬</span>
                    Contattaci su WhatsApp
                  </a>
                </li>
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
                <Link to={`/${currentLang}#consultation`} className="text-vesuviano-400 hover:text-vesuviano-300 transition-colors font-medium">
                  Contattaci
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArchitettoAI;
