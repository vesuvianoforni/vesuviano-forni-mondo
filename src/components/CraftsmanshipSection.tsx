
import { Button } from "@/components/ui/button";

const CraftsmanshipSection = () => {
  return (
    <section className="py-20 bg-stone-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-6">
              Artigianalità <span className="text-vesuviano-600">Napoletana</span>
            </h2>
            <p className="font-inter text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
              Ogni forno Vesuviano nasce dalle mani esperte di maestri artigiani napoletani, 
              custodi di una tradizione millenaria che unisce passione, tecnica e innovazione.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Content */}
            <div className="animate-slide-in-left">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-500">
                <h3 className="font-playfair text-3xl font-semibold text-charcoal-900 mb-6">
                  Tradizione che Vive
                </h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  Nel cuore di Napoli, i nostri maestri artigiani tramandano di generazione in generazione 
                  i segreti della lavorazione dei forni. Ogni pezzo è realizzato a mano con materiali 
                  selezionati e tecniche affinate nei secoli.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-vesuviano-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-charcoal-900 mb-1">Lavorazione Completamente Manuale</h4>
                      <p className="text-sm text-stone-600">Ogni dettaglio è curato dalle mani esperte dei nostri artigiani</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-vesuviano-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-charcoal-900 mb-1">Materiali Tradizionali</h4>
                      <p className="text-sm text-stone-600">Argilla refrattaria e materiali selezionati della tradizione napoletana</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-vesuviano-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-charcoal-900 mb-1">Expertise Generazionale</h4>
                      <p className="text-sm text-stone-600">Tecniche tramandate di padre in figlio per oltre un secolo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Image */}
            <div className="animate-slide-in-right">
              <div className="relative">
                <img 
                  src="/lovable-uploads/artigiano-mani-argilla.jpg" 
                  alt="Mani esperte di artigiano napoletano che lavora l'argilla refrattaria"
                  className="w-full rounded-xl shadow-lg hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h4 className="font-playfair text-xl font-bold mb-1">Napoli, Italia</h4>
                  <p className="text-sm opacity-90">Dove nasce l'eccellenza</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center group animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-vesuviano-50 transition-colors duration-300">
                <span className="text-3xl font-playfair font-bold text-vesuviano-600">100+</span>
              </div>
              <h4 className="font-semibold text-charcoal-900 mb-2">Anni di Tradizione</h4>
              <p className="text-sm text-stone-600">Un secolo di esperienza artigianale napoletana</p>
            </div>

            <div className="text-center group animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-vesuviano-50 transition-colors duration-300">
                <span className="text-3xl font-playfair font-bold text-vesuviano-600">15</span>
              </div>
              <h4 className="font-semibold text-charcoal-900 mb-2">Maestri Artigiani</h4>
              <p className="text-sm text-stone-600">Esperti selezionati per la loro maestria</p>
            </div>

            <div className="text-center group animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-vesuviano-50 transition-colors duration-300">
                <span className="text-3xl font-playfair font-bold text-vesuviano-600">∞</span>
              </div>
              <h4 className="font-semibold text-charcoal-900 mb-2">Passione Infinita</h4>
              <p className="text-sm text-stone-600">Amore per l'arte che non ha limiti</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-vesuviano-50 rounded-xl p-8 animate-scale-in" style={{ animationDelay: '0.8s' }}>
            <h3 className="font-playfair text-3xl font-bold text-charcoal-900 mb-4">
              Scopri la Differenza dell'Artigianalità
            </h3>
            <p className="text-stone-600 mb-6 max-w-2xl mx-auto">
              Ogni forno racconta una storia di passione, tradizione e maestria. 
              Scopri come l'artigianalità napoletana può trasformare la tua esperienza culinaria.
            </p>
            <Button 
              size="lg"
              className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-8 py-3 transition-all duration-300 hover:scale-105"
              onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Richiedi Informazioni
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CraftsmanshipSection;
