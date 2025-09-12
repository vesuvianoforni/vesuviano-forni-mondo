import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Wand2, Smartphone, Camera, Sparkles, Zap, Brain, Eye, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StabilityService } from "@/services/stabilityService";
import ARVisualizer from './oven-visualizer/ARVisualizer';
import CreativeLoader from './oven-visualizer/CreativeLoader';
import ImageResultModal from './oven-visualizer/ImageResultModal';
import DownloadModal from './oven-visualizer/DownloadModal';
import { OvenType } from './oven-visualizer/OvenTypeSelector';

const OvenVisualizer = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedOvenType, setSelectedOvenType] = useState<string>("");
  const [showARVisualizer, setShowARVisualizer] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

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
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files].slice(0, 3)); // Max 3 images
      toast.success(`${files.length} immagine/i caricate con successo!`);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const fetchUrlToBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generateOvenInSpace = async () => {
    if (selectedImages.length === 0 || !selectedOvenType) {
      toast.error("Carica almeno un'immagine e seleziona un forno");
      return;
    }

    setIsGenerating(true);
    
    try {
      const mainImage = selectedImages[0]; // Use first image as main
      const base64Image = await convertFileToBase64(mainImage);
      const selectedOvenData = ovenTypes.find(oven => oven.value === selectedOvenType);
      const ovenRefUrl = selectedOvenData?.image || '';
      const ovenImageBase64 = ovenRefUrl ? await fetchUrlToBase64(ovenRefUrl) : undefined;
      const promptText = `Inserisci il forno selezionato "${selectedOvenData?.label || 'forno a legna'}" nella foto caricata in fotorealismo, senza alterare la foto caricata, semplicemente inserendo il forno in modo equilibrato e naturale. Il forno deve integrarsi perfettamente nell'ambiente rispettando prospettiva, illuminazione e ombre.`;
      
      // 1) Prova con Gemini (edge function)
      const { data, error } = await supabase.functions.invoke('generate-oven-space', {
        body: {
          spaceImage: base64Image,
          ovenType: selectedOvenType,
          ovenModel: selectedOvenData?.label || 'forno a legna',
          ovenImage: ovenImageBase64
        }
      });

      if (error) throw error;

      if (data?.success && data?.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setShowResultModal(true);
        return;
      }

      // 2) Fallback automatico a Stability AI (se Gemini fallisce o ha quota esaurita)
      console.warn('Gemini non ha generato l\'immagine, faccio fallback su Stability. Dettagli:', data);
      const stability = new StabilityService();
      const result = await stability.generateImage({ positivePrompt: promptText, imageFile: mainImage });
      if (result?.success) {
        setGeneratedImageUrl(result.imageURL);
        setShowResultModal(true);
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
        setShowResultModal(true);
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
      {/* Loading Overlay */}
      {isGenerating && <CreativeLoader />}

      {/* Result Modal */}
      <ImageResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        imageUrl={generatedImageUrl}
        ovenModel={selectedOvenData?.label || ''}
        onDownload={() => {
          setShowResultModal(false);
          setShowDownloadModal(true);
        }}
      />

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        imageUrl={generatedImageUrl}
        ovenModel={selectedOvenData?.label || ''}
      />

      {/* AR Visualizer */}
      {showARVisualizer && (
        <ARVisualizer
          selectedOvenType={selectedOvenType}
          ovenTypes={ovenTypes}
          onClose={() => setShowARVisualizer(false)}
          uploadedModel={null}
        />
      )}
      
      {/* Main Section - Clean & Professional */}
      <section className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Clean Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-2xl mb-6">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Visualizzatore Forni
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Tecnologia avanzata per integrare i nostri forni nel vostro spazio
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* AI Generation Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-4">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-stone-900">Generazione AI</h2>
                    <p className="text-sm text-stone-600">Integrazione automatica nel vostro spazio</p>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-stone-400 mx-auto mb-3" />
                      <p className="font-medium text-stone-900 mb-1">Carica foto del tuo spazio</p>
                      <p className="text-sm text-stone-600">Fino a 3 immagini • JPG, PNG</p>
                    </label>
                  </div>

                  {/* Image Preview */}
                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Oven Selection */}
                  <div>
                    <h3 className="font-medium text-stone-900 mb-3">Scegli il forno</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {ovenTypes.map((oven) => (
                        <button
                          key={oven.value}
                          onClick={() => setSelectedOvenType(oven.value)}
                          className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                            selectedOvenType === oven.value
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <img
                            src={oven.image}
                            alt={oven.label}
                            className="w-full h-16 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <p className="text-white text-xs font-medium text-center px-2">
                              {oven.label.split(' - ')[0]}
                            </p>
                          </div>
                          {selectedOvenType === oven.value && (
                            <div className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={generateOvenInSpace}
                    disabled={selectedImages.length === 0 || !selectedOvenType || isGenerating}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Wand2 className="w-4 h-4" />
                        <span>Genera Immagine</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* AR Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center mr-4">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-stone-900">Realtà Aumentata</h2>
                    <p className="text-sm text-stone-600">Visualizzazione 3D in tempo reale</p>
                  </div>
                </div>

                {/* AR Features */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Camera className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">Fotocamera live</p>
                      <p className="text-sm text-stone-600">Utilizza la fotocamera del dispositivo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Smartphone className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">Controlli touch</p>
                      <p className="text-sm text-stone-600">Posiziona e ruota il modello 3D</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">Rendering real-time</p>
                      <p className="text-sm text-stone-600">Visualizzazione istantanea</p>
                    </div>
                  </div>
                </div>

                {/* Oven Selection for AR */}
                {!selectedOvenType && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      Seleziona un forno dalla sezione AI per attivare l'AR
                    </p>
                  </div>
                )}

                {/* AR Button */}
                <Button
                  onClick={startARVisualization}
                  disabled={!selectedOvenType}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Camera className="w-4 h-4" />
                    <span>Avvia AR</span>
                  </div>
                </Button>

                <p className="text-xs text-stone-500 text-center mt-3">
                  Compatibile con dispositivi iOS/Android moderni
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-stone-200">
              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-stone-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">Fotorealismo AI</h3>
              <p className="text-stone-600 text-sm">
                Integrazione perfetta con illuminazione naturale
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-stone-200">
              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-6 h-6 text-stone-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">Alta Qualità</h3>
              <p className="text-stone-600 text-sm">
                Immagini professionali ad alta risoluzione
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-stone-200">
              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-stone-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">Veloce</h3>
              <p className="text-stone-600 text-sm">
                Risultati in pochi secondi
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OvenVisualizer;