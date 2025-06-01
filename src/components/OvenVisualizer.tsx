
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Smartphone } from "lucide-react";
import { toast } from "sonner";
import AlertNotice from './oven-visualizer/AlertNotice';
import ImageUploadSection from './oven-visualizer/ImageUploadSection';
import OvenTypeSelector, { OvenType } from './oven-visualizer/OvenTypeSelector';
import ResultPreview from './oven-visualizer/ResultPreview';
import OvenModelsInfo from './oven-visualizer/OvenModelsInfo';
import ARVisualizer from './oven-visualizer/ARVisualizer';

const OvenVisualizer = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedOvenType, setSelectedOvenType] = useState<string>("");
  const [showARVisualizer, setShowARVisualizer] = useState(false);

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
                Visualizza il Tuo <span className="text-vesuviano-600">Forno in AR</span>
              </h2>
              <p className="font-inter text-sm md:text-lg text-stone-600 max-w-3xl mx-auto px-4">
                Usa la fotocamera del tuo dispositivo per vedere come apparirà un forno Vesuviano direttamente nel tuo ambiente.
              </p>
            </div>

            <AlertNotice hasApiKey={true} />

            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
              {/* Selection Section */}
              <div className="space-y-4 md:space-y-6">
                <div className="bg-white p-4 md:p-6 rounded-lg border border-stone-200">
                  <OvenTypeSelector 
                    ovenTypes={ovenTypes}
                    selectedOvenType={selectedOvenType}
                    onOvenTypeChange={setSelectedOvenType}
                  />
                  
                  <Button 
                    onClick={startARVisualization}
                    disabled={!selectedOvenType}
                    className="w-full mt-4 md:mt-6 bg-vesuviano-500 hover:bg-vesuviano-600 text-white text-sm md:text-base py-2 md:py-3"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Avvia Visualizzazione AR
                  </Button>

                  <p className="text-xs text-stone-500 text-center px-2 mt-2">
                    Richiede accesso alla fotocamera del dispositivo. Funziona meglio su mobile.
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
                  <h3 className="font-semibold text-xl mb-2">Modalità AR</h3>
                  <p className="text-stone-600 mb-4">
                    Seleziona un forno e clicca "Avvia Visualizzazione AR" per vedere il forno nel tuo ambiente reale tramite la fotocamera.
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
                        Pronto per la visualizzazione AR
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6 space-y-2 text-sm text-stone-500">
                    <p>✓ Posizionamento interattivo</p>
                    <p>✓ Controlli rotazione e scala</p>
                    <p>✓ Visualizzazione in tempo reale</p>
                  </div>
                </div>
              </div>
            </div>

            <OvenModelsInfo />
          </div>
        </div>
      </div>
    </>
  );
};

export default OvenVisualizer;
