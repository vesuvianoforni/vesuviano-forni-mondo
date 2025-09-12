import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Wand2, Smartphone, Camera, Zap, Brain, Eye, Image as ImageIcon, X } from "lucide-react";
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
  const [selectedMode, setSelectedMode] = useState<'ai' | 'ar' | null>(null);

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
      
      {/* Main Section */}
      <section className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            {/* New Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
              <span>Novità assoluta AI</span>
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Visualizzatore Forni
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-8">
              Scegli come visualizzare il tuo forno Vesuviano
            </p>

            {/* Mode Selection */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
              {/* AI Mode Card */}
              <button
                onClick={() => setSelectedMode('ai')}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  selectedMode === 'ai'
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMode === 'ai' ? 'bg-blue-500' : 'bg-stone-100'
                  }`}>
                    <Brain className={`w-6 h-6 ${selectedMode === 'ai' ? 'text-white' : 'text-stone-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">
                      Generazione AI
                    </h3>
                    <p className="text-stone-600 text-sm mb-3">
                      Carica una foto del tuo spazio e l'AI integrerà fotorealisticamente il forno selezionato
                    </p>
                    <div className="space-y-2 text-xs text-stone-500">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Risultato fotorealistico professionale</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Integrazione perfetta con illuminazione</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Immagine scaricabile ad alta risoluzione</span>
                      </div>
                    </div>
                  </div>
                </div>
                {selectedMode === 'ai' && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>

              {/* AR Mode Card */}
              <button
                onClick={() => setSelectedMode('ar')}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  selectedMode === 'ar'
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg transform scale-105'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMode === 'ar' ? 'bg-emerald-500' : 'bg-stone-100'
                  }`}>
                    <Eye className={`w-6 h-6 ${selectedMode === 'ar' ? 'text-white' : 'text-stone-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">
                      Realtà Aumentata
                    </h3>
                    <p className="text-stone-600 text-sm mb-3">
                      Usa la fotocamera del tuo dispositivo per vedere il forno 3D nel tuo spazio in tempo reale
                    </p>
                    <div className="space-y-2 text-xs text-stone-500">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Visualizzazione 3D interattiva</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Posizionamento e rotazione in tempo reale</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Compatibile con smartphone moderni</span>
                      </div>
                    </div>
                  </div>
                </div>
                {selectedMode === 'ar' && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Content Based on Selected Mode */}
          {selectedMode === 'ai' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-stone-900 mb-2">Generazione AI</h2>
                  <p className="text-stone-600">Integrazione automatica fotorealistica</p>
                </div>

                <div className="space-y-6">
                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3" />
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
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Oven Selection */}
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-4">Scegli il forno</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {ovenTypes.map((oven) => (
                        <button
                          key={oven.value}
                          onClick={() => setSelectedOvenType(oven.value)}
                          className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                            selectedOvenType === oven.value
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <img
                            src={oven.image}
                            alt={oven.label}
                            className="w-full h-20 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <p className="text-white text-xs font-medium text-center px-2">
                              {oven.label.split(' - ')[0]}
                            </p>
                          </div>
                          {selectedOvenType === oven.value && (
                            <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={generateOvenInSpace}
                    disabled={selectedImages.length === 0 || !selectedOvenType || isGenerating}
                    className={`w-full py-4 font-semibold rounded-xl transition-all duration-300 ${
                      isGenerating
                        ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse'
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="relative">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                        <span className="text-white">Generando con AI...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Wand2 className="w-5 h-5" />
                        <span>Genera Immagine AI</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {selectedMode === 'ar' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-stone-900 mb-2">Realtà Aumentata</h2>
                  <p className="text-stone-600">Visualizzazione 3D in tempo reale</p>
                </div>

                <div className="space-y-6">
                  {/* Oven Selection for AR */}
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-4">Scegli il forno per l'AR</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {ovenTypes.map((oven) => (
                        <button
                          key={oven.value}
                          onClick={() => setSelectedOvenType(oven.value)}
                          className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                            selectedOvenType === oven.value
                              ? 'border-emerald-500 ring-2 ring-emerald-200'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <img
                            src={oven.image}
                            alt={oven.label}
                            className="w-full h-20 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <p className="text-white text-xs font-medium text-center px-2">
                              {oven.label.split(' - ')[0]}
                            </p>
                          </div>
                          {selectedOvenType === oven.value && (
                            <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AR Features */}
                  <div className="bg-stone-50 rounded-xl p-6">
                    <h4 className="font-medium text-stone-900 mb-4">Cosa puoi fare con l'AR:</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Camera className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm text-stone-700">Usa la fotocamera per vedere il forno nel tuo spazio</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm text-stone-700">Tocca e trascina per posizionare il forno</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm text-stone-700">Ruota e ridimensiona in tempo reale</span>
                      </div>
                    </div>
                  </div>

                  {/* AR Button */}
                  <Button
                    onClick={startARVisualization}
                    disabled={!selectedOvenType}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 font-semibold rounded-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Camera className="w-5 h-5" />
                      <span>Avvia Modalità AR</span>
                    </div>
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-stone-500">
                      Richiede fotocamera e dispositivo iOS/Android moderno
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Info */}
          {!selectedMode && (
            <div className="text-center">
              <p className="text-stone-500">
                Seleziona una modalità per iniziare la visualizzazione del tuo forno
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default OvenVisualizer;