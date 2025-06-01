
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Award, Flame, Download, ExternalLink } from "lucide-react";

const VesuvioBuono = () => {
  const downloadPDF = () => {
    // Simulated PDF download
    console.log("Downloading VesuvioBuono PDF...");
    alert("PDF scaricato! (Simulazione)");
  };

  const visitWebsite = () => {
    window.open("https://www.vesuviobuono.com", "_blank");
  };

  return (
    <section id="vesuviobuono" className="py-20 bg-gradient-to-br from-gray-900 via-orange-900 to-gray-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-green-500/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-orange-400/30 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="bg-green-500 text-white px-6 py-3 text-xl font-bold mb-6 animate-scale-in">
              <Leaf className="mr-3" size={24} />
              ESCLUSIVA MONDIALE
            </Badge>
            <h2 className="font-playfair text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-in-left">
              Vesuvio<span className="text-orange-400">Buono</span>
            </h2>
            <p className="font-inter text-xl text-orange-100 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Il primo forno al mondo a legna e combinato gas/legna che non emette fuliggine in atmosfera. 
              Una rivoluzione per l'ambiente e la salute.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-slide-in-left" style={{ animationDelay: '0.5s' }}>
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-orange-200 hover:shadow-orange-500/20 transition-all duration-500 hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mr-4 animate-pulse">
                    <Leaf className="text-white" size={28} />
                  </div>
                  <h3 className="font-playfair text-2xl font-semibold text-gray-900">
                    Zero Emissioni
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="border-l-4 border-orange-500 pl-4 hover:border-l-8 transition-all duration-300">
                    <h4 className="font-semibold text-gray-900 mb-2">Tecnologia Brevettata</h4>
                    <p className="text-gray-600">Sistema di combustione completa che elimina il 99.9% delle particelle di fuliggine.</p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 hover:border-l-8 transition-all duration-300">
                    <h4 className="font-semibold text-gray-900 mb-2">Certificazioni Ambientali</h4>
                    <p className="text-gray-600">Conforme alle più severe normative europee e internazionali sulle emissioni.</p>
                  </div>

                  <div className="border-l-4 border-orange-400 pl-4 hover:border-l-8 transition-all duration-300">
                    <h4 className="font-semibold text-gray-900 mb-2">Doppia Alimentazione</h4>
                    <p className="text-gray-600">Funziona perfettamente sia a legna che con la combinazione gas/legna.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="animate-slide-in-right" style={{ animationDelay: '0.7s' }}>
              <div className="bg-gradient-to-br from-orange-600 via-orange-700 to-gray-800 text-white rounded-xl p-8 shadow-2xl border border-orange-400/30 hover:border-orange-400/60 transition-all duration-500 hover:scale-105">
                <div className="flex items-center mb-6">
                  <Award className="mr-3 animate-bounce" size={36} />
                  <h3 className="font-playfair text-3xl font-semibold">
                    Vantaggi Esclusivi
                  </h3>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-orange-300 rounded-full mt-2 mr-4 flex-shrink-0 animate-pulse"></div>
                    <span>Installazione in qualsiasi zona urbana senza restrizioni</span>
                  </li>
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-orange-300 rounded-full mt-2 mr-4 flex-shrink-0 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <span>Riduzione drastica dei costi di manutenzione camini</span>
                  </li>
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-orange-300 rounded-full mt-2 mr-4 flex-shrink-0 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <span>Mantenimento del sapore autentico della cottura a legna</span>
                  </li>
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-orange-300 rounded-full mt-2 mr-4 flex-shrink-0 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                    <span>Rispetto totale dell'ambiente e della comunità</span>
                  </li>
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-orange-300 rounded-full mt-2 mr-4 flex-shrink-0 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                    <span>Garanzia internazionale e supporto tecnico specializzato</span>
                  </li>
                </ul>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={downloadPDF}
                    className="bg-white text-orange-700 hover:bg-orange-50 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <Download className="mr-2" size={20} />
                    Scarica Scheda Tecnica
                  </Button>
                  <Button 
                    onClick={visitWebsite}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <ExternalLink className="mr-2" size={20} />
                    Visita il Sito
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '1s' }}>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-3xl mx-auto border border-orange-200 hover:shadow-orange-500/30 transition-all duration-500 hover:scale-105">
              <Flame className="mx-auto text-orange-600 mb-4 animate-bounce" size={48} />
              <h4 className="font-playfair text-3xl font-semibold text-gray-900 mb-4">
                Vuoi essere tra i primi al mondo?
              </h4>
              <p className="text-gray-600 mb-6 text-lg">
                VesuvioBuono rappresenta il futuro della cottura a legna. 
                Contattaci per avere informazioni esclusive e priorità nella produzione.
              </p>
              <Button 
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Diventa Partner Esclusivo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VesuvioBuono;
