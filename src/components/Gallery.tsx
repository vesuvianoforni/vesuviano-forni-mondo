
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("tutti");

  const images = [
    {
      id: 1,
      category: "legna",
      title: "Forno Tradizionale Napoletano",
      description: "Artigianato secolare per la pizza perfetta"
    },
    {
      id: 2,
      category: "gas",
      title: "Forno Professionale a Gas",
      description: "Controllo preciso per ristoranti moderni"
    },
    {
      id: 3,
      category: "elettrico",
      title: "Forno Elettrico di Design",
      description: "Tecnologia avanzata per ambienti urbani"
    },
    {
      id: 4,
      category: "rotante",
      title: "Forno Rotante Industriale",
      description: "Produzione continua ad alta efficienza"
    },
    {
      id: 5,
      category: "vesuviobuono",
      title: "VesuvioBuono - Zero Emissioni",
      description: "Il futuro della cottura sostenibile"
    },
    {
      id: 6,
      category: "legna",
      title: "Installazione Internazionale",
      description: "I nostri forni nel mondo"
    }
  ];

  const categories = [
    { id: "tutti", label: "Tutti i Forni" },
    { id: "legna", label: "A Legna" },
    { id: "gas", label: "A Gas" },
    { id: "elettrico", label: "Elettrici" },
    { id: "rotante", label: "Rotanti" },
    { id: "vesuviobuono", label: "VesuvioBuono" }
  ];

  const filteredImages = selectedCategory === "tutti" 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-6">
            Galleria dei Nostri Forni
          </h2>
          <p className="font-inter text-xl text-stone-600 max-w-3xl mx-auto mb-8">
            Ogni immagine racconta una storia di passione, tradizione e innovazione. 
            Scopri l'artigianato napoletano che conquista il mondo.
          </p>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id 
                    ? "bg-vesuviano-500 text-white hover:bg-vesuviano-600 border-vesuviano-500" 
                    : "text-vesuviano-700 border-vesuviano-300 hover:bg-vesuviano-50"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredImages.map((image, index) => (
            <Card 
              key={image.id} 
              className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-scale-in border-stone-200 hover:border-vesuviano-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  {/* Placeholder for images */}
                  <div className="w-full h-64 bg-stone-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                    <div className="text-center">
                      <img 
                        src="/lovable-uploads/vesuviobuono-verde-dettaglio.jpg" 
                        alt="Forno Vesuviano" 
                        className="w-16 h-16 mx-auto mb-4 object-cover rounded"
                      />
                      <p className="text-vesuviano-700 font-semibold">Immagine del Forno</p>
                    </div>
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-charcoal-900 bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-300 flex items-end">
                    <div className="p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-playfair text-xl font-semibold mb-2">
                        {image.title}
                      </h3>
                      <p className="text-sm opacity-90">
                        {image.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-stone-50 rounded-xl p-8 max-w-3xl mx-auto border border-stone-200">
            <h3 className="font-playfair text-2xl font-semibold text-charcoal-900 mb-4">
              Vuoi vedere i nostri forni dal vivo?
            </h3>
            <p className="text-stone-600 mb-6">
              Organizziamo visite al nostro laboratorio a Napoli o realizziamo rendering 3D 
              ad alta fedeltà per mostrarvi il vostro forno prima della produzione.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-vesuviano-500 text-white px-6 py-3 rounded-lg hover:bg-vesuviano-600 transition-colors">
                Prenota Visita in Laboratorio
              </button>
              <button className="border border-vesuviano-500 text-vesuviano-600 px-6 py-3 rounded-lg hover:bg-vesuviano-50 transition-colors">
                Richiedi Rendering 3D
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
