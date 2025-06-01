import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ProductCategories = () => {
  const categories = [
    {
      title: "Forni a Legna",
      description: "Tradizione autentica napoletana per il sapore unico che solo la legna può dare",
      features: ["Cottura tradizionale", "Sapore autentico", "Alta temperatura", "Versatili"],
      badge: "Tradizionale",
      badgeColor: "bg-copper-100 text-copper-700",
      delay: "0s"
    },
    {
      title: "Forni a Gas",
      description: "Controllo preciso della temperatura e facilità d'uso per professionisti",
      features: ["Controllo preciso", "Accensione rapida", "Efficienza energetica", "Facile manutenzione"],
      badge: "Professionale",
      badgeColor: "bg-stone-100 text-stone-700",
      delay: "0.2s"
    },
    {
      title: "Forni Elettrici",
      description: "Tecnologia avanzata per cotture perfette e costanti ogni volta",
      features: ["Temperatura costante", "Programmabile", "Eco-sostenibile", "Silenzioso"],
      badge: "Innovativo",
      badgeColor: "bg-vesuviano-100 text-vesuviano-700",
      delay: "0.4s"
    },
    {
      title: "Soluzioni Rotanti",
      description: "Massima efficienza produttiva con cottura uniforme su ogni superficie",
      features: ["Cottura uniforme", "Alta produttività", "Risparmio energetico", "Automazione"],
      badge: "Efficiente",
      badgeColor: "bg-charcoal-100 text-charcoal-700",
      delay: "0.6s"
    }
  ];

  return (
    <section id="products" className="py-20 bg-stone-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-6">
              Le Nostre <span className="text-vesuviano-600">Categorie</span>
            </h2>
            <p className="font-inter text-xl text-stone-600 max-w-3xl mx-auto">
              Soluzioni artigianali napoletane per ogni esigenza professionale, 
              dalla tradizione all'innovazione più avanzata.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {categories.map((category, index) => (
              <div 
                key={category.title}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fade-in group border border-stone-200 hover:border-vesuviano-300"
                style={{ animationDelay: category.delay }}
              >
                <div className="text-center mb-4">
                  <Badge className={`mb-4 px-3 py-1 ${category.badgeColor} transition-colors duration-300`}>
                    {category.badge}
                  </Badge>
                  <h3 className="font-playfair text-xl font-semibold text-charcoal-900 mb-3 group-hover:text-vesuviano-600 transition-colors duration-300">
                    {category.title}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-4">
                    {category.description}
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {category.features.map((feature, idx) => (
                    <li 
                      key={feature} 
                      className="flex items-center text-sm text-stone-600 hover:text-vesuviano-600 transition-colors duration-300 hover:translate-x-1"
                      style={{ transitionDelay: `${idx * 0.1}s` }}
                    >
                      <div className="w-2 h-2 bg-vesuviano-500 rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full bg-stone-100 text-stone-700 hover:bg-vesuviano-500 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Scopri di più
                </Button>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center animate-scale-in" style={{ animationDelay: '0.8s' }}>
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto border border-vesuviano-200 hover:shadow-xl transition-all duration-500 hover:scale-105">
              <h4 className="font-playfair text-2xl font-semibold text-charcoal-900 mb-4">
                Non trovi quello che cerchi?
              </h4>
              <p className="text-stone-600 mb-6">
                I nostri esperti sono pronti a creare la soluzione perfetta per le tue esigenze specifiche.
              </p>
              <Button 
                size="lg"
                className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-8 py-3 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Consulenza Personalizzata
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
