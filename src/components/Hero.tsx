
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const Hero = () => {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-charcoal-900 text-white overflow-hidden pt-20">
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-40 h-40 bg-vesuviano-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-32 h-32 bg-copper-500 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-vesuviano-400 rounded-full animate-ping" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 text-center z-10">
        {/* Logo Section */}
        <div className="mb-8 animate-scale-in">
          <img 
            src="/lovable-uploads/09675d10-6a80-4654-b66b-6547b522db56.png" 
            alt="Vesuviano - Forni Vulcanici Selezionati" 
            className="h-32 mx-auto mb-6 hover:scale-110 transition-transform duration-500"
          />
        </div>
        
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight animate-fade-in">
          <span className="block text-vesuviano-400 text-2xl md:text-3xl font-medium mb-2 animate-slide-in-left">Forni Artigianali Napoletani</span>
          <span className="block animate-slide-in-right" style={{ animationDelay: '0.3s' }}>di Eccellenza Internazionale</span>
        </h1>
        
        <p className="font-inter text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-stone-200 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          Artigianato napoletano selezionato per il mercato mondiale. 
          Forni a legna, gas, elettrici e la rivoluzionaria soluzione 
          <span className="text-vesuviano-400 font-semibold"> VesuvioBuono</span> a zero emissioni.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-scale-in" style={{ animationDelay: '0.9s' }}>
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
            className="border-2 border-vesuviano-400 text-vesuviano-400 hover:bg-vesuviano-400 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Consulenza Gratuita
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="animate-bounce" style={{ animationDelay: '1.2s' }}>
          <ArrowDown 
            className="mx-auto text-vesuviano-400 cursor-pointer hover:text-vesuviano-300 transition-colors hover:scale-125 duration-300" 
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
