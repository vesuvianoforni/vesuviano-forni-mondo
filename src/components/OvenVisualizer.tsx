
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import AlertNotice from './oven-visualizer/AlertNotice';
import ImageUploadSection from './oven-visualizer/ImageUploadSection';
import OvenTypeSelector, { OvenType } from './oven-visualizer/OvenTypeSelector';
import ResultPreview from './oven-visualizer/ResultPreview';
import OvenModelsInfo from './oven-visualizer/OvenModelsInfo';

const OvenVisualizer = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedOvenType, setSelectedOvenType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");

  const ovenTypes: OvenType[] = [
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

          <AlertNotice />

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {/* Upload Section */}
            <div className="space-y-4 md:space-y-6">
              <ImageUploadSection 
                previewUrl={previewUrl}
                onImageUpload={handleImageUpload}
              />
              
              <div className="bg-white p-4 md:p-6 rounded-lg border border-stone-200">
                <OvenTypeSelector 
                  ovenTypes={ovenTypes}
                  selectedOvenType={selectedOvenType}
                  onOvenTypeChange={setSelectedOvenType}
                />
                
                <Button 
                  onClick={generateVisualization}
                  disabled={!selectedImage || !selectedOvenType || isGenerating}
                  className="w-full mt-4 md:mt-6 bg-vesuviano-500 hover:bg-vesuviano-600 text-white text-sm md:text-base py-2 md:py-3"
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

                <p className="text-xs text-stone-500 text-center px-2 mt-2">
                  La generazione richiede circa 30-60 secondi. L'immagine sarà ottimizzata per il tuo spazio.
                </p>
              </div>
            </div>

            {/* Result Section */}
            <ResultPreview 
              generatedImage={generatedImage}
              isGenerating={isGenerating}
              selectedOvenData={selectedOvenData}
              onDownload={downloadImage}
            />
          </div>

          <OvenModelsInfo />
        </div>
      </div>
    </div>
  );
};

export default OvenVisualizer;
