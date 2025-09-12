
import { Button } from "@/components/ui/button";

const Services = () => {
  const services = [
    {
      title: "Consulenza Tecnica Specializzata",
      description: "I nostri esperti ti guidano nella scelta del forno perfetto per le tue esigenze specifiche, considerando spazio, volume di produzione e tipo di cucina.",
      features: ["Analisi delle esigenze", "Consigli personalizzati", "Supporto nella scelta", "Valutazione tecnica"]
    },
    {
      title: "Rendering 3D e Progettazione",
      description: "Visualizza il tuo forno nel contesto della tua cucina prima dell'acquisto con i nostri render fotorealistici 3D.",
      features: ["Render fotorealistici", "Integrazione ambientale", "Modifiche progettuali", "Anteprima realistica"]
    },
    {
      title: "Logistica Internazionale",
      description: "Gestiamo completamente la spedizione e l'installazione dei tuoi forni in tutto il mondo con massima sicurezza.",
      features: ["Spedizioni mondiali", "Imballaggio sicuro", "Tracking completo", "Consegna garantita"]
    },
    {
      title: "Formazione e Assistenza",
      description: "Corsi di formazione per utilizzare al meglio il tuo forno e assistenza post-vendita dedicata per ogni necessità.",
      features: ["Corsi pratici", "Assistenza tecnica", "Manutenzione", "Supporto continuo"]
    }
  ];

  return (
    <section className="py-20 bg-white">      
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-6">
              I Nostri <span className="text-vesuviano-600">Servizi</span>
            </h2>
            <p className="font-inter text-xl text-stone-600 max-w-3xl mx-auto">
              Un supporto completo dalla consulenza iniziale all'assistenza post-vendita, 
              per garantirti il massimo successo con i nostri forni artigianali.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => (
              <div 
                key={service.title}
                className="bg-stone-50 rounded-xl p-8 hover:shadow-lg transition-all duration-500 hover:scale-105 animate-fade-in group border border-stone-200 hover:border-vesuviano-300"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <h3 className="font-playfair text-2xl font-semibold text-charcoal-900 mb-4 group-hover:text-vesuviano-600 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  {service.description}
                </p>

                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
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
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center animate-scale-in" style={{ animationDelay: '0.8s' }}>
            <div className="bg-vesuviano-50 rounded-xl p-8 max-w-3xl mx-auto border border-vesuviano-200 hover:shadow-xl transition-all duration-500 hover:scale-105">
              <h4 className="font-playfair text-2xl font-semibold text-charcoal-900 mb-4">
                Hai bisogno di supporto personalizzato?
              </h4>
              <p className="text-stone-600 mb-6">
                Il nostro team è sempre disponibile per offrirti la migliore assistenza 
                e trovare insieme la soluzione ideale per la tua attività.
              </p>
              <Button 
                size="lg"
                className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-8 py-3 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Contattaci Ora
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quality Photo Section */}
      <div className="container mx-auto px-6 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-playfair text-2xl md:text-3xl font-semibold text-charcoal-900 mb-4">
              La Nostra <span className="text-vesuviano-600">Qualità Artigianale</span>
            </h3>
            <p className="text-stone-600 text-lg">
              Forni realizzati con materiali di eccellenza e finiture impeccabili
            </p>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
            <img 
              src="/lovable-uploads/forno-nero-elegante.png"
              alt="Forno Vesuviano con rivestimento metallico nero - Qualità artigianale italiana"
              className="w-full h-64 md:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-vesuviano-900/60 via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h4 className="font-playfair text-xl md:text-2xl font-semibold mb-2">
                Forno Artigianale con Rivestimento Metallico
              </h4>
              <p className="text-stone-200 text-sm md:text-base">
                La qualità e l'eleganza dei nostri forni rappresentano l'eccellenza dell'artigianato italiano
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
