
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/83490d78-6935-41ab-bb12-49e6070f44db.png" 
              alt="Vesuviano Logo" 
              className="h-10 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="font-playfair text-xl font-bold text-gray-900">Vesuviano</h1>
              <p className="text-xs text-gray-600">Forni Vulcanici Selezionati</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#products" className="text-gray-700 hover:text-orange-600 transition-colors">Prodotti</a>
            <a href="#vesuviobuono" className="text-gray-700 hover:text-orange-600 transition-colors">VesuvioBuono</a>
            <a href="#gallery" className="text-gray-700 hover:text-orange-600 transition-colors">Galleria</a>
            <a href="#consultation" className="text-gray-700 hover:text-orange-600 transition-colors">Consulenza</a>
          </nav>

          {/* CTA Button */}
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Contattaci
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
