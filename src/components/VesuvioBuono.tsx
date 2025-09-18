import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Award, Flame, Download, Shield, CheckCircle } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const VesuvioBuono = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    phone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDownloadPDF = async () => {
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.city || !formData.phone) {
      toast({
        title: "Errore",
        description: "Per favore compila tutti i campi",
        variant: "destructive"
      });
      return;
    }

    try {
      // Send form data to our notification system
      await supabase.functions.invoke('send-form-data', {
        body: {
          formType: 'vesuvio-buono',
          data: formData
        }
      });

      // Close dialog and download PDF
      setIsDialogOpen(false);
      const link = document.createElement('a');
      link.href = '/lovable-uploads/vesuviobuono-scheda-tecnica.pdf';
      link.download = 'VesuvioBuono_Scheda_Tecnica.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        city: '',
        phone: ''
      });

      toast({
        title: "Download completato!",
        description: "La scheda tecnica è stata scaricata con successo.",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova più tardi.",
        variant: "destructive"
      });
    }
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/lovable-uploads/vesuviobuono-scheda-tecnica.pdf';
    link.download = 'VesuvioBuono_Scheda_Tecnica.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const visitWebsite = () => {
    window.open("https://www.vesuviobuono.com", "_blank");
  };

  return (
    <section id="vesuviobuono" className="py-20 bg-vesuviano-900 relative overflow-hidden">
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Badge className="bg-vesuviano-500 text-white px-6 py-3 text-xl font-bold animate-scale-in border-none">
                <Leaf className="mr-3" size={24} />
                ESCLUSIVA MONDIALE
              </Badge>
              <Badge className="bg-amber-600 text-white px-6 py-3 text-xl font-bold animate-scale-in border-none" style={{ animationDelay: '0.1s' }}>
                <Shield className="mr-3" size={24} />
                BREVETTATO
              </Badge>
            </div>
            <h2 className="font-playfair text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-in-left">
              Vesuvio<span className="text-vesuviano-500 drop-shadow-lg">Buono</span>
            </h2>
            <p className="font-inter text-xl text-vesuviano-200 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Il primo forno al mondo a legna e combinato gas/legna che non emette fuliggine in atmosfera. 
              Una rivoluzione per l'ambiente e la salute.
            </p>
          </div>

          {/* Video Section */}
          <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="max-w-4xl mx-auto bg-stone-900 rounded-xl p-6 border-2 border-vesuviano-400 hover:border-vesuviano-300 transition-all duration-300">
              <h3 className="font-playfair text-2xl font-semibold text-vesuviano-100 mb-4 text-center">
                VesuvioBuono in Azione
              </h3>
              <div className="aspect-video rounded-lg overflow-hidden relative">
                <VideoPlayer
                  src="https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/videos/ENG%20-%20VIDEO%20PRESENTAZIONE%20VESUVIO%20BUONO%20(1)%20-%20RESIZE%20-%20Videobolt.net.mp4"
                  poster="/lovable-uploads/vesuviobuono-forno-azione.jpg"
                  className="w-full h-full"
                />
                {/* Overlay to hide watermark in bottom right */}
                <div className="absolute bottom-0 right-0 w-32 h-16 bg-gradient-to-l from-vesuviano-900 via-vesuviano-900/80 to-transparent pointer-events-none"></div>
              </div>
              <p className="text-vesuviano-200 text-center mt-4 text-sm">
                Scopri come VesuvioBuono rivoluziona la cottura a legna senza emissioni
              </p>
            </div>
          </div>

          {/* Photo Gallery Section */}
          <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo Slot 1 */}
              <div className="bg-stone-900 rounded-xl p-4 border-2 border-vesuviano-400 hover:border-vesuviano-300 transition-all duration-300 hover:scale-105">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src="/lovable-uploads/vesuviobuono-forno-azione.jpg" 
                    alt="Forno VesuvioBuono in azione" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-vesuviano-400 text-center mt-2 text-sm">Forno in Azione</p>
              </div>
              
              {/* Photo Slot 2 */}
              <div className="bg-stone-900 rounded-xl p-4 border-2 border-copper-400 hover:border-copper-300 transition-all duration-300 hover:scale-105">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src="/lovable-uploads/vesuviobuono-pizza-perfetta.jpg" 
                    alt="Pizza perfetta nel forno VesuvioBuono" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-copper-400 text-center mt-2 text-sm">Pizza Perfetta</p>
              </div>
              
              {/* Photo Slot 3 */}
              <div className="bg-stone-900 rounded-xl p-4 border-2 border-vesuviano-400 hover:border-vesuviano-300 transition-all duration-300 hover:scale-105">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src="/lovable-uploads/vesuviobuono-zero-emissioni.jpg" 
                    alt="Forno VesuvioBuono zero emissioni" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-vesuviano-400 text-center mt-2 text-sm">Zero Emissioni</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-slide-in-left" style={{ animationDelay: '0.7s' }}>
              <div className="bg-white rounded-xl shadow-2xl p-8 border border-vesuviano-200 hover:shadow-vesuviano-500/20 transition-all duration-500 hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-vesuviano-500 rounded-full flex items-center justify-center mr-4">
                    <Leaf className="text-white" size={28} />
                  </div>
                  <h3 className="font-playfair text-2xl font-semibold text-charcoal-900">
                    Zero Emissioni
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="border-l-4 border-vesuviano-500 pl-4 hover:border-l-8 transition-all duration-300 relative">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-stone-900">Tecnologia Brevettata</h4>
                      <Badge className="bg-amber-100 text-amber-800 px-2 py-1 text-xs border-amber-200">
                        <CheckCircle className="mr-1" size={12} />
                        PATENT
                      </Badge>
                    </div>
                    <p className="text-stone-600">Sistema di combustione completa che elimina il 99.9% delle particelle di fuliggine.</p>
                  </div>

                  <div className="border-l-4 border-copper-500 pl-4 hover:border-l-8 transition-all duration-300">
                    <h4 className="font-semibold text-charcoal-900 mb-2">Certificazioni Ambientali</h4>
                    <p className="text-stone-600">Conforme alle più severe normative europee e internazionali sulle emissioni.</p>
                  </div>

                  <div className="border-l-4 border-vesuviano-400 pl-4 hover:border-l-8 transition-all duration-300">
                    <h4 className="font-semibold text-charcoal-900 mb-2">Doppia Alimentazione</h4>
                    <p className="text-stone-600">Funziona perfettamente sia a legna che con la combinazione gas/legna.</p>
                  </div>
                </div>

                {/* Additional Photo Slots */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-stone-100 rounded-lg p-3 hover:scale-105 transition-all duration-300">
                    <div className="aspect-square rounded overflow-hidden">
                      <img 
                        src="/lovable-uploads/vesuviobuono-forno-legna.jpg" 
                        alt="Installazione VesuvioBuono" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-stone-600 text-center mt-2 text-xs">Forno a legna</p>
                  </div>
                  <div className="bg-stone-100 rounded-lg p-3 hover:scale-105 transition-all duration-300">
                    <div className="aspect-square rounded overflow-hidden">
                      <img 
                        src="/lovable-uploads/vesuviobuono-ostepizza-aperto.jpg" 
                        alt="Certificazioni VesuvioBuono" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-stone-600 text-center mt-2 text-xs">Depuratore fumi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="animate-slide-in-right" style={{ animationDelay: '0.9s' }}>
              <div className="bg-vesuviano-600 text-white rounded-xl p-8 shadow-2xl border border-vesuviano-400 hover:border-vesuviano-300 transition-all duration-500 hover:scale-105">
                <div className="flex items-center mb-6">
                  <Award className="mr-3" size={36} />
                  <h3 className="font-playfair text-3xl font-semibold">
                    Vantaggi Esclusivi
                  </h3>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-vesuviano-200 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <span>Installazione in qualsiasi zona urbana senza restrizioni</span>
                  </li>
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-vesuviano-200 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <span>Riduzione drastica dei costi di manutenzione camini</span>
                  </li>
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-vesuviano-200 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <span>Mantenimento del sapore autentico della cottura a legna</span>
                  </li>
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-vesuviano-200 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <span>Rispetto totale dell'ambiente e della comunità</span>
                  </li>
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-vesuviano-200 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <span>Garanzia internazionale e supporto tecnico specializzato</span>
                  </li>
                </ul>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-white text-vesuviano-700 hover:bg-stone-100 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
                        <Download className="mr-2" size={20} />
                        Scarica Scheda Tecnica
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="text-vesuviano-800">Scarica Scheda Tecnica</DialogTitle>
                        <DialogDescription>
                          Compila i tuoi dati per scaricare la scheda tecnica di VesuvioBuono
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="firstName">Nome</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="lastName">Cognome</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="city">Città</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Numero di telefono</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Annulla
                        </Button>
                        <Button onClick={handleDownloadPDF} className="bg-vesuviano-600 hover:bg-vesuviano-700">
                          Scarica PDF
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Additional Photo Slot in Right Column */}
                <div className="mt-8">
                  <div className="bg-vesuviano-700 rounded-lg p-4 hover:scale-105 transition-all duration-300">
                    <div className="aspect-video rounded overflow-hidden">
                      <img 
                        src="/lovable-uploads/artigiano-lavorazione.jpg" 
                        alt="Produzione artigianale VesuvioBuono" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-vesuviano-200 text-center mt-2 text-sm">Produzione Artigianale</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Abbattitore di Fuliggine Section */}
          <div className="mt-16 animate-fade-in" style={{ animationDelay: '1.1s' }}>
            <div className="bg-gradient-to-r from-stone-800 to-stone-900 rounded-xl shadow-2xl p-8 border border-vesuviano-400/30 hover:border-vesuviano-400/50 transition-all duration-500">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-vesuviano-500 rounded-full flex items-center justify-center mr-4">
                        <Leaf className="text-white" size={24} />
                      </div>
                      <h3 className="font-playfair text-2xl md:text-3xl font-semibold text-white">
                        Abbattitore di Fuliggine ad Acqua
                      </h3>
                    </div>
                    <Badge className="bg-amber-600 text-white px-3 py-2 text-sm font-bold border-none">
                      <Shield className="mr-2" size={16} />
                      BREVETTATO
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <p className="text-vesuviano-200 text-lg leading-relaxed">
                      Sistema innovativo prodotto e realizzato in collaborazione con l'azienda leader del settore, 
                      che garantisce <strong className="text-vesuviano-400">zero problemi di vicinato e normative</strong>.
                    </p>
                    <div className="bg-vesuviano-600/20 border border-vesuviano-400/30 rounded-lg p-4">
                      <h4 className="font-semibold text-vesuviano-300 mb-2">Vantaggi Tecnici:</h4>
                      <ul className="text-vesuviano-200 space-y-2 text-sm">
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-vesuviano-400 rounded-full mr-3"></div>
                          Eliminazione completa delle particelle nocive
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-vesuviano-400 rounded-full mr-3"></div>
                          Conformità a tutte le normative ambientali
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-vesuviano-400 rounded-full mr-3"></div>
                          Installazione possibile in qualsiasi contesto urbano
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-stone-700/50 rounded-lg p-4 border border-vesuviano-400/20">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      src="/lovable-uploads/abbattitore-fuliggine-acqua.png" 
                      alt="Abbattitore di Fuliggine ad Acqua - Sistema interno" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-vesuviano-300 text-center mt-3 text-sm font-medium">
                    Sistema Interno Abbattitore Fuliggine
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-3xl mx-auto border border-vesuviano-200 hover:shadow-vesuviano-500/30 transition-all duration-500 hover:scale-105">
              <Flame className="mx-auto text-vesuviano-600 mb-4" size={48} />
              <h4 className="font-playfair text-3xl font-semibold text-charcoal-900 mb-4">
                Vuoi essere tra i primi al mondo?
              </h4>
              <p className="text-stone-600 mb-6 text-lg">
                VesuvioBuono rappresenta il futuro della cottura a legna. 
                Contattaci per avere informazioni esclusive e priorità nella produzione.
              </p>
              <Button 
                size="lg"
                className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-10 py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
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
