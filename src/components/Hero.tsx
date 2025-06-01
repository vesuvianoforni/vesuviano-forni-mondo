
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const Hero = () => {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-vesuviano-900 via-vesuviano-800 to-fire-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 text-center z-10 animate-fade-in">
        <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="block">Vesuviano</span>
          <span className="text-fire-400 text-3xl md:text-4xl font-medium">Forni Artigianali Napoletani</span>
        </h1>
        
        <p className="font-inter text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-gray-200">
          Eccellenza artigianale napoletana per il mercato internazionale. 
          Forni a legna, gas, elettrici e la rivoluzionaria soluzione 
          <span className="text-fire-400 font-semibold"> VesuvioBuono</span> a zero emissioni.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="bg-fire-600 hover:bg-fire-700 text-white px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            onClick={scrollToProducts}
          >
            Scopri i Nostri Forni
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-fire-400 text-fire-400 hover:bg-fire-400 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300"
            onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Consulenza Gratuita
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="animate-bounce">
          <ArrowDown 
            className="mx-auto text-fire-400 cursor-pointer hover:text-fire-300 transition-colors" 
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
