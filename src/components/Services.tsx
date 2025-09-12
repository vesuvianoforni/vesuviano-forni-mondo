
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
                className={`${
                  service.title === "Logistica Internazionale" 
                    ? "relative bg-gradient-to-br from-stone-900/90 to-stone-800/95 text-white overflow-hidden" 
                    : "bg-stone-50 border border-stone-200 hover:border-vesuviano-300"
                } rounded-xl p-8 hover:shadow-lg transition-all duration-500 hover:scale-105 animate-fade-in group`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Background image for Logistica Internazionale */}
                {service.title === "Logistica Internazionale" && (
                  <>
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-30 transition-opacity duration-700 group-hover:opacity-50"
                      style={{
                        backgroundImage: 'url(/lovable-uploads/logistica-internazionale-nyc.png)'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-vesuviano-900/80 to-stone-900/90" />
                  </>
                )}
                
                <div className="relative z-10">
                  <h3 className={`font-playfair text-2xl font-semibold mb-4 transition-colors duration-300 ${
                    service.title === "Logistica Internazionale" 
                      ? "text-white group-hover:text-vesuviano-300" 
                      : "text-charcoal-900 group-hover:text-vesuviano-600"
                  }`}>
                    {service.title}
                  </h3>
                  <p className={`leading-relaxed mb-6 ${
                    service.title === "Logistica Internazionale" 
                      ? "text-stone-200" 
                      : "text-stone-600"
                  }`}>
                    {service.description}
                  </p>

                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li 
                        key={feature} 
                        className={`flex items-center text-sm transition-colors duration-300 hover:translate-x-1 ${
                          service.title === "Logistica Internazionale"
                            ? "text-stone-300 hover:text-vesuviano-300"
                            : "text-stone-600 hover:text-vesuviano-600"
                        }`}
                        style={{ transitionDelay: `${idx * 0.1}s` }}
                      >
                        <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                          service.title === "Logistica Internazionale" 
                            ? "bg-vesuviano-400" 
                            : "bg-vesuviano-500"
                        }`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
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
    </section>
  );
};

export default Services;
