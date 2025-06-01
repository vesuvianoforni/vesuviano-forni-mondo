
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const Hero = () => {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-700 to-orange-900 text-white overflow-hidden pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 text-center z-10 animate-fade-in">
        {/* Logo Section */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/09675d10-6a80-4654-b66b-6547b522db56.png" 
            alt="Vesuviano - Forni Vulcanici Selezionati" 
            className="h-32 mx-auto mb-6"
          />
        </div>
        
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight">
          <span className="block text-orange-400 text-2xl md:text-3xl font-medium mb-2">Forni Artigianali Napoletani</span>
          <span className="block">di Eccellenza Internazionale</span>
        </h1>
        
        <p className="font-inter text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-gray-200">
          Artigianato napoletano selezionato per il mercato mondiale. 
          Forni a legna, gas, elettrici e la rivoluzionaria soluzione 
          <span className="text-orange-400 font-semibold"> VesuvioBuono</span> a zero emissioni.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            onClick={scrollToProducts}
          >
            Scopri i Nostri Forni
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300"
            onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Consulenza Gratuita
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="animate-bounce">
          <ArrowDown 
            className="mx-auto text-orange-400 cursor-pointer hover:text-orange-300 transition-colors" 
            size={32}
            onClick={scrollToProducts}
          />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
    </section>
  );
};

export default Hero;
