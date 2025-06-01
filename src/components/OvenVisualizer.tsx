import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import AlertNotice from './oven-visualizer/AlertNotice';
import ImageUploadSection from './oven-visualizer/ImageUploadSection';
import OvenTypeSelector, { OvenType } from './oven-visualizer/OvenTypeSelector';
import ResultPreview from './oven-visualizer/ResultPreview';
import OvenModelsInfo from './oven-visualizer/OvenModelsInfo';
import { StabilityService } from '@/services/stabilityService';

const OvenVisualizer = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedOvenType, setSelectedOvenType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [stabilityService] = useState<StabilityService>(new StabilityService());

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

  // Funzione per ottenere la descrizione dettagliata del forno
  const getOvenDescription = (ovenType: string) => {
    switch (ovenType) {
      case "vesuviobuono":
        return "a traditional Neapolitan wood-fired pizza oven with elegant mosaic tile finish in warm terracotta and cream colors, featuring a classic dome shape with decorative mosaic patterns, black metal door with glass window, and professional brick chimney";
      case "verniciato":
        return "a rustic Italian wood-fired pizza oven with smooth terracotta painted finish, traditional dome-shaped design, black cast iron door, and classic brick construction with warm earth-tone colors";
      case "mosaicato":
        return "a customizable Italian wood-fired pizza oven with beautiful mosaic tile finish, featuring intricate decorative patterns in Mediterranean colors, dome-shaped structure, elegant metal door, and artistic tile work";
      default:
        return "a traditional Italian wood-fired pizza oven";
    }
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

    setIsGenerating(true);
    
    try {
      const selectedOven = ovenTypes.find(oven => oven.value === selectedOvenType);
      if (!selectedOven) {
        throw new Error("Tipo di forno non trovato");
      }

      const ovenDescription = getOvenDescription(selectedOvenType);

      // Prompt ottimizzato con descrizione dettagliata del forno specifico
      const prompt = `Seamlessly integrate and install ${ovenDescription} into this exact kitchen scene. PRESERVE COMPLETELY: all existing kitchen elements including cabinets, countertops, wall colors, lighting fixtures, appliances, flooring, and architectural details. The oven must be naturally built into the most logical wall space or corner, appearing as an original part of the kitchen design. Add ONLY: appropriate stone or brick surround that matches the kitchen style, professional ventilation hood that complements existing cabinetry, and minimal installation details. Maintain identical lighting, shadows, camera angle, and perspective as the original photo. The oven should look professionally installed and integrated, not added on top. Photorealistic architectural visualization, high detail, perfect integration.`;

      console.log("Generazione AI con descrizione dettagliata forno:", ovenDescription);
      console.log("Prompt completo:", prompt);

      const result = await stabilityService.generateImage({
        positivePrompt: prompt,
        imageFile: selectedImage
      });
      
      setGeneratedImage(result.imageURL);
      toast.success("Forno integrato con successo nella tua cucina!");
    } catch (error) {
      console.error("Errore nella generazione AI:", error);
      toast.error("Errore nella generazione AI. Riprova.");
      
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

          <AlertNotice hasApiKey={true} />

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
                      Generazione AI in corso...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Genera Visualizzazione AI
                    </>
                  )}
                </Button>

                <p className="text-xs text-stone-500 text-center px-2 mt-2">
                  La generazione AI richiede circa 30-60 secondi. L'immagine sarà ottimizzata per il tuo spazio.
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
