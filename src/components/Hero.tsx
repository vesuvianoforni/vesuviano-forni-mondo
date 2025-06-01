
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const Hero = () => {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/lovable-uploads/b7f6c6d5-8b4a-4f39-9c2d-7e3f5a1b8c9d.png)'
        }}
      >
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 text-center z-10 relative">
        {/* Logo Section */}
        <div className="mb-8 animate-scale-in">
          <img 
            src="/lovable-uploads/09675d10-6a80-4654-b66b-6547b522db56.png" 
            alt="Vesuviano - Forni Vulcanici Selezionati" 
            className="h-32 mx-auto mb-6 hover:scale-110 transition-transform duration-500"
          />
        </div>
        
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight animate-fade-in text-white">
          <span className="block text-vesuviano-400 text-2xl md:text-3xl font-medium mb-2 animate-slide-in-left">Forni Artigianali Napoletani</span>
          <span className="block animate-slide-in-right" style={{ animationDelay: '0.3s' }}>di Eccellenza Internazionale</span>
        </h1>
        
        <p className="font-inter text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-gray-200 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          Artigianato napoletano selezionato per il mercato mondiale. 
          Forni a legna, gas, elettrici e la rivoluzionaria soluzione 
          <span className="text-vesuviano-400 font-semibold"> VesuvioBuono</span> a zero emissioni.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-scale-in" style={{ animationDelay: '0.9s' }}>
          <Button 
            size="lg" 
            className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            onClick={scrollToProducts}
          >
            Scopri i Nostri Forni
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-vesuviano-500 text-vesuviano-500 hover:bg-vesuviano-500 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Consulenza Gratuita
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-8 animate-bounce" style={{ animationDelay: '1.2s' }}>
          <ArrowDown 
            className="mx-auto text-white cursor-pointer hover:text-vesuviano-400 transition-colors hover:scale-125 duration-300 drop-shadow-lg" 
            size={32}
            onClick={scrollToProducts}
          />
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-stone-50 to-transparent"></div>
    </section>
  );
};

export default Hero;
