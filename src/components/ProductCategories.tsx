
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ProductCategories = () => {
  const categories = [
    {
      title: "Forni Tradizionali",
      subtitle: "Wood Fired Ovens",
      description: "L'autentica tradizione napoletana per pizze dal sapore inconfondibile. Cottura a legna per il massimo del gusto.",
      features: ["Cottura tradizionale a legna", "Temperatura fino a 500°C", "Sapore autentico napoletano", "Versatili per pizza e pane"],
      image: "/lovable-uploads/83490d78-6935-41ab-bb12-49e6070f44db.png"
    },
    {
      title: "Forni a Gas",
      subtitle: "Gas Fired Ovens", 
      description: "Controllo preciso e facilità d'uso per professionisti che cercano efficienza e qualità costante.",
      features: ["Controllo preciso temperatura", "Accensione istantanea", "Efficienza energetica", "Manutenzione semplificata"],
      image: "/lovable-uploads/83490d78-6935-41ab-bb12-49e6070f44db.png"
    },
    {
      title: "Forni Elettrici",
      subtitle: "Electric Ovens",
      description: "Tecnologia avanzata per cotture perfette, costanti e rispettose dell'ambiente.",
      features: ["Temperatura costante", "Controllo digitale", "Eco-sostenibile", "Funzionamento silenzioso"],
      image: "/lovable-uploads/83490d78-6935-41ab-bb12-49e6070f44db.png"
    },
    {
      title: "Forni Rotanti",
      subtitle: "Rotating Ovens",
      description: "Massima produttività con cottura uniforme su ogni superficie. Ideali per alta produzione.",
      features: ["Cottura uniforme", "Alta produttività", "Automazione avanzata", "Efficienza energetica"],
      image: "/lovable-uploads/83490d78-6935-41ab-bb12-49e6070f44db.png"
    }
  ];

  return (
    <section id="products" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-4">
              Le Nostre <span className="text-vesuviano-600">Soluzioni</span>
            </h2>
            <p className="font-inter text-lg text-stone-600 max-w-2xl mx-auto">
              Forni artigianali napoletani per ogni esigenza professionale
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {categories.map((category, index) => (
              <Card 
                key={category.title}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border border-stone-200 hover:border-vesuviano-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-playfair text-2xl font-bold mb-1">{category.title}</h3>
                    <p className="text-sm opacity-90 font-inter">{category.subtitle}</p>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <p className="text-stone-600 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {category.features.map((feature, idx) => (
                      <li 
                        key={feature}
                        className="flex items-center text-sm text-stone-600 hover:text-vesuviano-600 transition-colors duration-300"
                      >
                        <div className="w-1.5 h-1.5 bg-vesuviano-500 rounded-full mr-3 flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full bg-stone-100 text-stone-700 hover:bg-vesuviano-500 hover:text-white transition-all duration-300"
                    onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Scopri di più
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="text-center bg-stone-50 rounded-2xl p-8 animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <h3 className="font-playfair text-3xl font-bold text-charcoal-900 mb-4">
              Soluzioni Su Misura
            </h3>
            <p className="text-stone-600 mb-6 max-w-2xl mx-auto">
              Ogni forno Vesuviano è progettato per soddisfare le esigenze specifiche della tua attività. 
              I nostri esperti ti aiuteranno a trovare la soluzione perfetta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-8 py-3 transition-all duration-300 hover:scale-105"
                onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Consulenza Gratuita
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-vesuviano-500 text-vesuviano-600 hover:bg-vesuviano-500 hover:text-white px-8 py-3 transition-all duration-300"
                onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Vedi Gallery
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
