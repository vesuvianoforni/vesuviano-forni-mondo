
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Smartphone, Wand2, Download } from "lucide-react";
import { toast } from "sonner";
import AlertNotice from './oven-visualizer/AlertNotice';
import ImageUploadSection from './oven-visualizer/ImageUploadSection';
import OvenTypeSelector, { OvenType } from './oven-visualizer/OvenTypeSelector';
import ResultPreview from './oven-visualizer/ResultPreview';
import { supabase } from "@/integrations/supabase/client";
import { StabilityService } from "@/services/stabilityService";

import ARVisualizer from './oven-visualizer/ARVisualizer';

const OvenVisualizer = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedOvenType, setSelectedOvenType] = useState<string>("");
  const [showARVisualizer, setShowARVisualizer] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const ovenTypes: OvenType[] = [
    { 
      value: "cabin_mosaic", 
      label: "VesuvioBuono - Cabin Mosaic",
      image: "/lovable-uploads/vesuviobuono-marrone-completo.jpg",
      modelUrl: "https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/3d-models/CABIN_MOSAIC_v001.fbx"
    },
    { 
      value: "black_mosaic", 
      label: "Rivestimento Palladiana - Black Mosaic",
      image: "/lovable-uploads/vesuviobuono-verde-mosaico.jpg",
      modelUrl: "https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/3d-models/BLACK_MOSAIC_v001.fbx"
    },
    { 
      value: "mosaic", 
      label: "Rivestimento Mosaico - Classic",
      image: "/lovable-uploads/vesuviobuono-osteria-pizza.jpg",
      modelUrl: "https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/3d-models/MOSAIC_v001.fbx"
    },
    { 
      value: "metal", 
      label: "Doghe Metalliche - Metal Design",
      image: "/lovable-uploads/forno-metallo-nero.png",
      modelUrl: "https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/3d-models/METAL_v001.fbx"
    }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Reset generated image when new space is uploaded
      setGeneratedImageUrl("");
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const generateOvenInSpace = async () => {
    if (!selectedImage || !selectedOvenType) {
      toast.error("Seleziona un'immagine dello spazio e un tipo di forno");
      return;
    }

    setIsGenerating(true);
    
    try {
      const base64Image = await convertFileToBase64(selectedImage);
      const selectedOvenData = ovenTypes.find(oven => oven.value === selectedOvenType);
      const promptText = `Inserisci il forno selezionato "${selectedOvenData?.label || 'forno a legna'}" nella foto caricata in fotorealismo, senza alterare la foto caricata, semplicemente inserendo il forno in modo equilibrato e naturale. Il forno deve integrarsi perfettamente nell'ambiente rispettando prospettiva, illuminazione e ombre.`;
      
      // 1) Prova con Gemini (edge function)
      const { data, error } = await supabase.functions.invoke('generate-oven-space', {
        body: {
          spaceImage: base64Image,
          ovenType: selectedOvenType,
          ovenModel: selectedOvenData?.label || 'forno a legna'
        }
      });

      if (error) throw error;

      if (data?.success && data?.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        toast.success("Immagine generata con successo!");
        return;
      }

      // 2) Fallback automatico a Stability AI (se Gemini fallisce o ha quota esaurita)
      console.warn('Gemini non ha generato l\'immagine, faccio fallback su Stability. Dettagli:', data);
      const stability = new StabilityService();
      const result = await stability.generateImage({ positivePrompt: promptText, imageFile: selectedImage });
      if (result?.success) {
        setGeneratedImageUrl(result.imageURL);
        toast.success("Immagine generata (fallback Stability)");
        return;
      }

      // 3) Fallback finale: OpenAI gpt-image-1
      console.warn('Stability non riuscito, provo fallback OpenAI');
      const { data: openaiData, error: openaiError } = await supabase.functions.invoke('generate-image-openai', {
        body: {
          prompt: promptText,
          imageBase64: base64Image
        }
      });
      if (openaiError) throw openaiError;
      if (openaiData?.imageUrl || openaiData?.imageURL) {
        setGeneratedImageUrl(openaiData.imageUrl || openaiData.imageURL);
        toast.success("Immagine generata (fallback OpenAI)");
        return;
      }

      throw new Error(data?.error || 'Errore nella generazione');
    } catch (error: any) {
      console.error('Errore generazione:', error);
      const msg = error?.message || 'Errore sconosciuto';
      toast.error(`Errore nella generazione: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const startARVisualization = () => {
    if (!selectedOvenType) {
      toast.error("Seleziona un tipo di forno prima di avviare l'AR");
      return;
    }

    // Verifica supporto per getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Il tuo dispositivo non supporta l'accesso alla fotocamera");
      return;
    }

    setShowARVisualizer(true);
    toast.success("Modalità AR avviata! Punta la fotocamera dove vuoi posizionare il forno");
  };

  const selectedOvenData = ovenTypes.find(oven => oven.value === selectedOvenType);

  return (
    <>
      {showARVisualizer && (
        <ARVisualizer
          selectedOvenType={selectedOvenType}
          ovenTypes={ovenTypes}
          onClose={() => setShowARVisualizer(false)}
          uploadedModel={null}
        />
      )}
      
      <div className="bg-stone-50 py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-block bg-vesuviano-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
                Realtà Aumentata (AR)
              </div>
              <h2 className="font-playfair text-2xl md:text-4xl lg:text-5xl font-bold text-charcoal-900 mb-3 md:mb-4 px-2">
                Visualizza il Tuo <span className="text-vesuviano-600">Forno nel Tuo Spazio</span>
              </h2>
              <p className="font-inter text-sm md:text-lg text-stone-600 max-w-3xl mx-auto px-4">
                Carica una foto del tuo spazio e genera con l'AI un'immagine realistica del forno Vesuviano perfettamente integrato.
              </p>
            </div>

            <AlertNotice hasApiKey={true} />

            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
              {/* Selection Section */}
              <div className="space-y-4 md:space-y-6">
                <div className="bg-white p-4 md:p-6 rounded-lg border border-stone-200">
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2 text-vesuviano-600">
                      🔥 Seleziona il Tuo Forno Vesuviano
                    </h3>
                    <p className="text-sm text-stone-600">
                      Scegli il modello per generare l'immagine nel tuo spazio
                    </p>
                  </div>
                  
                  <OvenTypeSelector
                    ovenTypes={ovenTypes}
                    selectedOvenType={selectedOvenType}
                    onOvenTypeChange={setSelectedOvenType}
                  />
                  
                  <Button 
                    onClick={generateOvenInSpace}
                    disabled={!selectedOvenType || !selectedImage || isGenerating}
                    className="w-full mt-4 md:mt-6 bg-vesuviano-500 hover:bg-vesuviano-600 text-white text-sm md:text-base py-3 md:py-4"
                  >
                    <Wand2 className="w-5 h-5 mr-2" />
                    {isGenerating ? 'Generazione in corso...' : `🚀 Genera Immagine - ${selectedOvenData?.label.split(' - ')[0] || 'Seleziona Forno'}`}
                  </Button>

                  <Button 
                    onClick={startARVisualization}
                    disabled={!selectedOvenType}
                    variant="outline"
                    className="w-full mt-2 text-sm md:text-base py-3 md:py-4"
                  >
                    <Smartphone className="w-5 h-5 mr-2" />
                    📱 Modalità AR (Opzionale)
                  </Button>

                  <p className="text-xs text-stone-500 text-center px-2 mt-3">
                    🤖 Alimentato da AI • 📱 AR disponibile su smartphone
                  </p>
                </div>

                {/* Opzione foto cucina per riferimento */}
                <ImageUploadSection 
                  previewUrl={previewUrl}
                  onImageUpload={handleImageUpload}
                />
              </div>

              {/* Preview Section */}
              <div className="bg-white p-4 md:p-6 rounded-lg border border-stone-200">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-vesuviano-500" />
                  <h3 className="font-semibold text-xl mb-2">Anteprima Generata</h3>
                  
                  {generatedImageUrl ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img 
                          src={generatedImageUrl} 
                          alt="Forno generato nel tuo spazio"
                          className="w-full rounded-lg shadow-lg"
                        />
                        <Button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = generatedImageUrl;
                            link.download = `forno-${selectedOvenType}-generato.jpg`;
                            link.click();
                          }}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-vesuviano-600 shadow-md"
                          size="sm"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-vesuviano-600 font-medium">
                        Ecco come apparirà il tuo {selectedOvenData?.label} nel tuo spazio!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-stone-600 mb-4">
                        Carica una foto del tuo spazio, seleziona un forno e genera l'immagine con l'AI.
                      </p>
                      
                      {selectedOvenData && (
                        <div className="mt-4 p-4 bg-vesuviano-50 rounded-lg">
                          <img 
                            src={selectedOvenData.image} 
                            alt={selectedOvenData.label}
                            className="w-full h-32 object-contain rounded-lg mb-2"
                          />
                          <p className="text-sm font-medium text-vesuviano-800">
                            {selectedOvenData.label}
                          </p>
                          <p className="text-xs text-vesuviano-600 mt-1">
                            Pronto per la generazione AI
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-6 space-y-2 text-sm text-stone-500">
                    <p>✓ Generazione AI realistica</p>
                    <p>✓ Integrazione perfetta nell'ambiente</p>
                    <p>✓ Download ad alta risoluzione</p>
                  </div>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </>
  );
};

export default OvenVisualizer;
