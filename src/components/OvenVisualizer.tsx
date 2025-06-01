
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import AlertNotice from './oven-visualizer/AlertNotice';
import ApiKeyInput from './oven-visualizer/ApiKeyInput';
import ImageUploadSection from './oven-visualizer/ImageUploadSection';
import OvenTypeSelector, { OvenType } from './oven-visualizer/OvenTypeSelector';
import ResultPreview from './oven-visualizer/ResultPreview';
import OvenModelsInfo from './oven-visualizer/OvenModelsInfo';
import { RunwareService } from '@/services/runwareService';

const OvenVisualizer = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedOvenType, setSelectedOvenType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [runwareService, setRunwareService] = useState<RunwareService | null>(null);

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

  useEffect(() => {
    const savedApiKey = localStorage.getItem('runware_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setRunwareService(new RunwareService(savedApiKey));
    }
  }, []);

  const handleApiKeySet = (newApiKey: string) => {
    setApiKey(newApiKey);
    setRunwareService(new RunwareService(newApiKey));
    toast.success("Chiave API configurata con successo!");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedImage("");
    }
  };

  const generateVisualization = async () => {
    if (!selectedImage || !selectedOvenType) {
      toast.error("Seleziona un'immagine e un tipo di forno");
      return;
    }

    if (!runwareService) {
      toast.error("Configura prima la chiave API Runware");
      return;
    }

    setIsGenerating(true);
    
    try {
      const selectedOven = ovenTypes.find(oven => oven.value === selectedOvenType);
      if (!selectedOven) {
        throw new Error("Tipo di forno non trovato");
      }

      // Crea un prompt dettagliato per l'AI
      const prompt = `A beautiful ${selectedOven.label} wood-fired pizza oven integrated into a modern kitchen setting. The oven should be professionally installed with proper ventilation, surrounded by elegant stonework or tiles. High quality, realistic lighting, professional photography style, 4K resolution. The kitchen should look modern and inviting with the traditional Italian pizza oven as the centerpiece.`;

      console.log("Generazione AI in corso con prompt:", prompt);

      const result = await runwareService.generateImage({
        positivePrompt: prompt,
        model: "runware:100@1",
        numberResults: 1,
        outputFormat: "WEBP",
        CFGScale: 7,
        scheduler: "FlowMatchEulerDiscreteScheduler",
      });
      
      setGeneratedImage(result.imageURL);
      toast.success("Visualizzazione AI generata con successo!");
    } catch (error) {
      console.error("Errore nella generazione AI:", error);
      toast.error("Errore nella generazione AI. Verifica la chiave API e riprova.");
      
      // Fallback alla simulazione in caso di errore
      const selectedOven = ovenTypes.find(oven => oven.value === selectedOvenType);
      if (selectedOven) {
        setGeneratedImage(selectedOven.image);
        toast.info("Utilizzata visualizzazione di fallback");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) {
      toast.error("Nessuna immagine da scaricare");
      return;
    }

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
          {/* Header */}
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

          <AlertNotice hasApiKey={!!apiKey} />
          
          {!apiKey && (
            <ApiKeyInput onApiKeySet={handleApiKeySet} isValid={!!runwareService} />
          )}

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
                  disabled={!selectedImage || !selectedOvenType || isGenerating || !apiKey}
                  className="w-full mt-4 md:mt-6 bg-vesuviano-500 hover:bg-vesuviano-600 text-white text-sm md:text-base py-2 md:py-3"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generazione AI in corso...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      {apiKey ? "Genera Visualizzazione AI" : "Configura API per iniziare"}
                    </>
                  )}
                </Button>

                <p className="text-xs text-stone-500 text-center px-2 mt-2">
                  {apiKey 
                    ? "La generazione AI richiede circa 30-60 secondi. L'immagine sarà ottimizzata per il tuo spazio."
                    : "Inserisci la chiave API Runware per utilizzare l'AI reale."
                  }
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
