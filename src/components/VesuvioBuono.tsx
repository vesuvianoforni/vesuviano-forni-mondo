
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Award, Flame, Download } from "lucide-react";

const VesuvioBuono = () => {
  const downloadPDF = () => {
    // Simulated PDF download
    console.log("Downloading VesuvioBuono PDF...");
    alert("PDF scaricato! (Simulazione)");
  };

  return (
    <section id="vesuviobuono" className="py-20 bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg font-semibold mb-4">
              <Leaf className="mr-2" size={20} />
              ESCLUSIVA MONDIALE
            </Badge>
            <h2 className="font-playfair text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Vesuvio<span className="text-orange-600">Buono</span>
            </h2>
            <p className="font-inter text-xl text-gray-600 max-w-3xl mx-auto">
              Il primo forno al mondo a legna e combinato gas/legna che non emette fuliggine in atmosfera. 
              Una rivoluzione per l'ambiente e la salute.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-slide-in-left">
              <div className="bg-white rounded-xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <Leaf className="text-white" size={24} />
                  </div>
                  <h3 className="font-playfair text-2xl font-semibold text-gray-900">
                    Zero Emissioni
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Tecnologia Brevettata</h4>
                    <p className="text-gray-600">Sistema di combustione completa che elimina il 99.9% delle particelle di fuliggine.</p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Certificazioni Ambientali</h4>
                    <p className="text-gray-600">Conforme alle più severe normative europee e internazionali sulle emissioni.</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Doppia Alimentazione</h4>
                    <p className="text-gray-600">Funziona perfettamente sia a legna che con la combinazione gas/legna.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="animate-fade-in">
              <div className="bg-gradient-to-br from-orange-600 to-gray-600 text-white rounded-xl p-8">
                <div className="flex items-center mb-6">
                  <Award className="mr-3" size={32} />
                  <h3 className="font-playfair text-2xl font-semibold">
                    Vantaggi Esclusivi
                  </h3>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-300 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Installazione in qualsiasi zona urbana senza restrizioni</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-300 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Riduzione drastica dei costi di manutenzione camini</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-300 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Mantenimento del sapore autentico della cottura a legna</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-300 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Rispetto totale dell'ambiente e della comunità</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-300 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Garanzia internazionale e supporto tecnico specializzato</span>
                  </li>
                </ul>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={downloadPDF}
                    className="bg-white text-orange-700 hover:bg-gray-100 flex items-center justify-center"
                  >
                    <Download className="mr-2" size={20} />
                    Scarica Scheda Tecnica
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-orange-700"
                    onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Richiedi Quotazione
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
              <Flame className="mx-auto text-orange-600 mb-4" size={48} />
              <h4 className="font-playfair text-2xl font-semibold text-gray-900 mb-4">
                Vuoi essere tra i primi al mondo?
              </h4>
              <p className="text-gray-600 mb-6">
                VesuvioBuono rappresenta il futuro della cottura a legna. 
                Contattaci per avere informazioni esclusive e priorità nella produzione.
              </p>
              <Button 
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
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
