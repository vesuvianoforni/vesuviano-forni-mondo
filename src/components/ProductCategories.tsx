
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Zap, Settings, RotateCcw } from "lucide-react";

const ProductCategories = () => {
  const categories = [
    {
      title: "Forni a Legna",
      description: "Tradizione e sapore autentico. I nostri forni a legna mantengono viva l'antica arte napoletana della cottura.",
      icon: Flame,
      features: ["Temperatura fino a 500°C", "Sapore affumicato naturale", "Design tradizionale", "Materiali refrattari di qualità"],
      color: "from-fire-500 to-fire-700"
    },
    {
      title: "Forni a Gas",
      description: "Praticità e controllo perfetto. Ideali per uso professionale con precisione nella gestione della temperatura.",
      icon: Flame,
      features: ["Controllo preciso temperatura", "Accensione istantanea", "Efficienza energetica", "Facile manutenzione"],
      color: "from-blue-500 to-blue-700"
    },
    {
      title: "Forni Elettrici",
      description: "Tecnologia moderna per risultati eccellenti. Perfetti per ambienti urbani e uso intensivo.",
      icon: Zap,
      features: ["Zero emissioni locali", "Controllo digitale", "Riscaldamento uniforme", "Silenziosità"],
      color: "from-purple-500 to-purple-700"
    },
    {
      title: "Soluzioni Rotanti",
      description: "Innovazione e uniformità. I forni rotanti garantiscono una cottura perfettamente omogenea.",
      icon: RotateCcw,
      features: ["Cottura uniforme", "Maggiore capacità", "Automazione avanzata", "Efficienza produttiva"],
      color: "from-green-500 to-green-700"
    }
  ];

  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Le Nostre Categorie
          </h2>
          <p className="font-inter text-xl text-gray-600 max-w-3xl mx-auto">
            Ogni forno è un capolavoro di artigianato napoletano, progettato per soddisfare 
            le esigenze più diverse del mercato internazionale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.title} 
                className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="text-white" size={32} />
                  </div>
                  
                  <h3 className="font-playfair text-2xl font-semibold text-gray-900 mb-3">
                    {category.title}
                  </h3>
                  
                  <p className="font-inter text-gray-600 mb-4 leading-relaxed">
                    {category.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {category.features.map((feature, idx) => (
                      <li key={idx} className="font-inter text-sm text-gray-500 flex items-center">
                        <div className="w-2 h-2 bg-vesuviano-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant="outline" 
                    className="w-full border-vesuviano-500 text-vesuviano-700 hover:bg-vesuviano-500 hover:text-white transition-all duration-300"
                  >
                    Scopri di Più
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="font-playfair text-2xl font-semibold text-gray-900 mb-4">
              Forni Fissi e Rotanti
            </h3>
            <p className="font-inter text-gray-600 mb-6">
              Ogni categoria è disponibile sia in versione fissa che rotante, 
              permettendo di scegliere la soluzione più adatta alle vostre esigenze produttive.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-left">
                <h4 className="font-semibold text-vesuviano-700 mb-2">Forni Fissi</h4>
                <p className="text-sm text-gray-600">Ideali per pizzerie tradizionali e ristoranti che privilegiano l'autenticità e il controllo manuale della cottura.</p>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-vesuviano-700 mb-2">Forni Rotanti</h4>
                <p className="text-sm text-gray-600">Perfetti per produzioni intensive che richiedono uniformità e velocità, mantenendo alta la qualità.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
