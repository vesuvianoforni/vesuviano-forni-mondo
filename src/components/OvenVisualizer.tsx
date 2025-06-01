
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, Eye, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const OvenVisualizer = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedOvenType, setSelectedOvenType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");

  const ovenTypes = [
    { 
      value: "vesuviobuono", 
      label: "VesuvioBuono - Mosaico Premium",
      image: "/lovable-uploads/3127ebb1-b7dd-4e50-95a6-a5d9ea57fce2.png"
    },
    { 
      value: "verniciato", 
      label: "Forno Verniciato - Terracotta",
      image: "/lovable-uploads/7c682e61-1ca7-4b06-9099-55b05bbff4db.png"
    },
    { 
      value: "mosaicato", 
      label: "Forno Mosaicato - Personalizzabile",
      image: "/lovable-uploads/375da131-c387-490a-8372-89300626480e.png"
    }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedImage(""); // Reset generated image
    }
  };

  const generateVisualization = async () => {
    if (!selectedImage || !selectedOvenType) {
      toast.error("Seleziona un'immagine e un tipo di forno");
      return;
    }

    setIsGenerating(true);
    
    try {
      // ATTENZIONE: Questa è ancora una simulazione
      // Per implementare l'AI reale, serve integrare un servizio come Runware
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulazione: combinazione delle due immagini
      // In realtà dovrebbe essere elaborata dall'AI
      const selectedOven = ovenTypes.find(oven => oven.value === selectedOvenType);
      if (selectedOven) {
        setGeneratedImage(selectedOven.image);
      }
      
      toast.success("Visualizzazione generata con successo!");
      toast.info("NOTA: Questa è una simulazione. Per l'AI reale serve integrare Runware o servizio simile.");
    } catch (error) {
      toast.error("Errore nella generazione. Riprova.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) {
      toast.error("Nessuna immagine da scaricare");
      return;
    }

    // Crea un link temporaneo per il download
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `forno-vesuviano-${selectedOvenType}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Download avviato!");
  };

  const selectedOvenData = ovenTypes.find(oven => oven.value === selectedOvenType);

  return (
    <div className="bg-stone-50 py-8 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header - Mobile Optimized */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-block bg-vesuviano-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
              Innovazione AI
            </div>
            <h2 className="font-playfair text-2xl md:text-4xl lg:text-5xl font-bold text-charcoal-900 mb-3 md:mb-4 px-2">
              Visualizza il Tuo <span className="text-vesuviano-600">Forno Ideale</span>
            </h2>
            <p className="font-inter text-sm md:text-lg text-stone-600 max-w-3xl mx-auto px-4">
              Carica una foto della tua cucina e scopri come apparirà un forno Vesuviano nel tuo spazio.
            </p>
          </div>

          {/* Alert per la simulazione */}
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 text-sm md:text-base">
                  Funzionalità in Sviluppo
                </h3>
                <p className="text-yellow-700 text-xs md:text-sm mt-1">
                  Attualmente questa è una simulazione. Per implementare l'AI reale di generazione immagini, 
                  è necessario integrare servizi come Runware AI o Stability AI.
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {/* Upload Section - Mobile Fixed */}
            <Card className="h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Upload className="w-4 h-4 md:w-5 md:h-5 text-vesuviano-500 flex-shrink-0" />
                  Carica la Tua Cucina
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                {/* Image Upload */}
                <div>
                  <Label htmlFor="kitchen-image" className="text-sm font-medium text-stone-700">
                    Foto della Cucina
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="kitchen-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-xs md:text-sm file:mr-2 md:file:mr-4 file:py-1 md:file:py-2 file:px-2 md:file:px-4 file:rounded-full file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-vesuviano-50 file:text-vesuviano-700 hover:file:bg-vesuviano-100"
                    />
                  </div>
                  {previewUrl && (
                    <div className="mt-3 md:mt-4">
                      <img 
                        src={previewUrl} 
                        alt="Preview cucina" 
                        className="w-full h-32 md:h-48 object-cover rounded-lg border border-stone-200"
                      />
                    </div>
                  )}
                </div>

                {/* Oven Type Selection */}
                <div>
                  <Label htmlFor="oven-type" className="text-sm font-medium text-stone-700">
                    Tipo di Forno Vesuviano
                  </Label>
                  <Select value={selectedOvenType} onValueChange={setSelectedOvenType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Seleziona il modello di forno" />
                    </SelectTrigger>
                    <SelectContent>
                      {ovenTypes.map((oven) => (
                        <SelectItem key={oven.value} value={oven.value}>
                          {oven.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Preview del forno selezionato - Mobile Optimized */}
                  {selectedOvenData && (
                    <div className="mt-3 md:mt-4 p-3 md:p-4 bg-white rounded-lg border border-stone-200">
                      <p className="text-xs md:text-sm font-medium text-stone-700 mb-2">Anteprima Forno Selezionato:</p>
                      <img 
                        src={selectedOvenData.image} 
                        alt={selectedOvenData.label}
                        className="w-full h-24 md:h-32 object-contain rounded-lg"
                      />
                      <p className="text-xs text-stone-500 mt-2 text-center">{selectedOvenData.label}</p>
                    </div>
                  )}
                </div>

                {/* Generate Button - Mobile Optimized */}
                <Button 
                  onClick={generateVisualization}
                  disabled={!selectedImage || !selectedOvenType || isGenerating}
                  className="w-full bg-vesuviano-500 hover:bg-vesuviano-600 text-white text-sm md:text-base py-2 md:py-3"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generazione in corso...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Genera Visualizzazione AI
                    </>
                  )}
                </Button>

                <p className="text-xs text-stone-500 text-center px-2">
                  La generazione richiede circa 30-60 secondi. L'immagine sarà ottimizzata per il tuo spazio.
                </p>
              </CardContent>
            </Card>

            {/* Result Section - Mobile Fixed */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Eye className="w-4 h-4 md:w-5 md:h-5 text-vesuviano-500 flex-shrink-0" />
                  Anteprima Risultato
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!generatedImage && !isGenerating && (
                  <div className="h-64 md:h-96 border-2 border-dashed border-stone-300 rounded-lg flex items-center justify-center">
                    <div className="text-center text-stone-500 px-4">
                      <Upload className="w-8 md:w-12 h-8 md:h-12 mx-auto mb-3 md:mb-4 opacity-50" />
                      <p className="text-base md:text-lg font-medium">La tua visualizzazione apparirà qui</p>
                      <p className="text-xs md:text-sm mt-1">Carica un'immagine e seleziona un forno per iniziare</p>
                    </div>
                  </div>
                )}

                {isGenerating && (
                  <div className="h-64 md:h-96 border border-stone-300 rounded-lg flex items-center justify-center bg-stone-50">
                    <div className="text-center px-4">
                      <Loader2 className="w-8 md:w-12 h-8 md:h-12 mx-auto mb-3 md:mb-4 animate-spin text-vesuviano-500" />
                      <p className="text-base md:text-lg font-medium text-stone-700">Generazione in corso...</p>
                      <p className="text-xs md:text-sm text-stone-500 mt-1">La nostra AI sta creando la tua visualizzazione personalizzata</p>
                      <div className="mt-3 md:mt-4 text-xs text-stone-400">
                        Integrando il forno {selectedOvenData?.label} nella tua cucina...
                      </div>
                    </div>
                  </div>
                )}

                {generatedImage && (
                  <div className="space-y-3 md:space-y-4">
                    <img 
                      src={generatedImage} 
                      alt="Forno visualizzato nella cucina" 
                      className="w-full h-64 md:h-96 object-contain rounded-lg border border-stone-200 bg-white"
                    />
                    <div className="bg-vesuviano-50 p-3 md:p-4 rounded-lg">
                      <p className="text-sm font-medium text-vesuviano-800 mb-1">
                        Modello: {selectedOvenData?.label}
                      </p>
                      <p className="text-xs text-vesuviano-600">
                        Simulazione completata - Questa è un'anteprima di come apparirà il tuo forno
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                      <Button 
                        variant="outline" 
                        onClick={downloadImage}
                        className="flex-1 text-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Scarica Immagine
                      </Button>
                      <Button 
                        className="flex-1 bg-vesuviano-500 hover:bg-vesuviano-600 text-sm"
                        onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Richiedi Preventivo
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Section - Mobile Optimized */}
          <div className="mt-8 md:mt-12 text-center">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-stone-200">
              <h3 className="font-playfair text-xl md:text-2xl font-bold text-charcoal-900 mb-3 md:mb-4">
                I Nostri Modelli di Forno
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
                <div className="text-center">
                  <img 
                    src="/lovable-uploads/3127ebb1-b7dd-4e50-95a6-a5d9ea57fce2.png" 
                    alt="VesuvioBuono" 
                    className="w-16 h-16 md:w-24 md:h-24 object-contain mx-auto mb-3 md:mb-4 rounded-lg border border-stone-200"
                  />
                  <h4 className="font-semibold text-stone-900 mb-1 md:mb-2 text-sm md:text-base">VesuvioBuono</h4>
                  <p className="text-xs md:text-sm text-stone-600">Rivestimento a mosaico premium con tecnologia avanzata</p>
                </div>
                <div className="text-center">
                  <img 
                    src="/lovable-uploads/7c682e61-1ca7-4b06-9099-55b05bbff4db.png" 
                    alt="Verniciato" 
                    className="w-16 h-16 md:w-24 md:h-24 object-contain mx-auto mb-3 md:mb-4 rounded-lg border border-stone-200"
                  />
                  <h4 className="font-semibold text-stone-900 mb-1 md:mb-2 text-sm md:text-base">Verniciato</h4>
                  <p className="text-xs md:text-sm text-stone-600">Finitura verniciata tradizionale in terracotta</p>
                </div>
                <div className="text-center">
                  <img 
                    src="/lovable-uploads/375da131-c387-490a-8372-89300626480e.png" 
                    alt="Mosaicato" 
                    className="w-16 h-16 md:w-24 md:h-24 object-contain mx-auto mb-3 md:mb-4 rounded-lg border border-stone-200"
                  />
                  <h4 className="font-semibold text-stone-900 mb-1 md:mb-2 text-sm md:text-base">Mosaicato</h4>
                  <p className="text-xs md:text-sm text-stone-600">Rivestimento a mosaico personalizzabile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OvenVisualizer;
