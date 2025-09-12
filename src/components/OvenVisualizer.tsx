import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      
      {/* Main Section */}
      <div className="min-h-screen gradient-bg relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full animate-float animation-delay-1000"></div>
          <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-float animation-delay-2000"></div>
          <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-white/10 rounded-full animate-float animation-delay-500"></div>
        </div>

        <div className="relative z-10 py-20 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 px-6 py-2 text-sm font-medium">
                🚀 Tecnologia AI Avanzata
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Visualizza il Tuo
                <br />
                <span className="bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                  Forno Perfetto
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Usa l'AI per vedere come apparirà il tuo forno Vesuviano nel tuo spazio,
                <br />oppure esploralo in Realtà Aumentata
              </p>
            </div>

            {/* Two Main Cards */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* AI Image Generation Card */}
              <Card className="apple-card rounded-3xl overflow-hidden border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-600 to-charcoal-700 rounded-2xl mb-4">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-charcoal-800 bg-clip-text text-transparent mb-2">
                      Generazione AI
                    </h2>
                    <p className="text-gray-600">
                      Carica le foto del tuo spazio e lascia che l'AI integri il forno perfettamente
                    </p>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/50">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-12 h-12 text-blue-500 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          Carica Foto del Tuo Spazio
                        </p>
                        <p className="text-sm text-gray-600 text-center">
                          Seleziona fino a 3 immagini (JPG, PNG)<br />
                          <span className="text-blue-600 font-medium">Clicca qui per sfogliare</span>
                        </p>
                      </label>
                    </div>

                    {/* Selected Images Preview */}
                    {selectedImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-xl"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Oven Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Scegli il Tuo Forno Vesuviano
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {ovenTypes.map((oven) => (
                          <button
                            key={oven.value}
                            onClick={() => setSelectedOvenType(oven.value)}
                            className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                              selectedOvenType === oven.value
                                ? 'border-blue-500 bg-blue-50 transform scale-105'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <img
                              src={oven.image}
                              alt={oven.label}
                              className="w-full h-20 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <p className="text-white text-xs font-medium text-center px-2">
                                {oven.label.split(' - ')[0]}
                              </p>
                            </div>
                            {selectedOvenType === oven.value && (
                              <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateOvenInSpace}
                      disabled={selectedImages.length === 0 || !selectedOvenType || isGenerating}
                      className="w-full bg-gradient-to-r from-slate-600 via-charcoal-700 to-slate-800 hover:from-slate-500 hover:via-charcoal-600 hover:to-slate-700 text-white font-bold py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Wand2 className="w-6 h-6 mr-2" />
                      {isGenerating ? 'Magia in corso...' : '✨ Genera Immagine AI'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AR Visualization Card */}
              <Card className="apple-card rounded-3xl overflow-hidden border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-charcoal-600 to-slate-700 rounded-2xl mb-4">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-charcoal-700 to-slate-800 bg-clip-text text-transparent mb-2">
                      Realtà Aumentata
                    </h2>
                    <p className="text-gray-600">
                      Vedi il forno nel tuo spazio reale usando la fotocamera del tuo dispositivo
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* AR Features */}
                    <div className="space-y-4">
                       <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                         <Camera className="w-6 h-6 text-slate-600" />
                         <span className="text-sm font-medium text-slate-800">
                           Utilizza la fotocamera in tempo reale
                         </span>
                       </div>
                       <div className="flex items-center space-x-3 p-3 bg-charcoal-50 rounded-xl">
                         <Smartphone className="w-6 h-6 text-charcoal-600" />
                         <span className="text-sm font-medium text-charcoal-800">
                           Posiziona e ruota il forno 3D
                         </span>
                       </div>
                       <div className="flex items-center space-x-3 p-3 bg-slate-100 rounded-xl">
                         <Zap className="w-6 h-6 text-slate-700" />
                         <span className="text-sm font-medium text-slate-800">
                           Visualizzazione istantanea
                         </span>
                       </div>
                    </div>

                    {/* Oven Selection for AR */}
                    {!selectedOvenType && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-amber-800 text-sm text-center">
                          Seleziona un forno nella sezione AI per utilizzare l'AR
                        </p>
                      </div>
                    )}

                    {/* AR Button */}
                    <Button
                      onClick={startARVisualization}
                      disabled={!selectedOvenType}
                      className="w-full bg-gradient-to-r from-charcoal-600 to-slate-700 hover:from-charcoal-500 hover:to-slate-600 text-white font-bold py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Smartphone className="w-6 h-6 mr-2" />
                      🥽 Avvia Modalità AR
                    </Button>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        Funziona su dispositivi iOS/Android moderni
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-effect rounded-2xl p-6 text-center text-white">
                <Sparkles className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                <h3 className="font-bold text-lg mb-2">AI Fotorealistica</h3>
                <p className="text-white/80 text-sm">
                  Integrazione perfetta con illuminazione e prospettiva naturali
                </p>
              </div>
              
              <div className="glass-effect rounded-2xl p-6 text-center text-white">
                <ImageIcon className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                <h3 className="font-bold text-lg mb-2">Alta Risoluzione</h3>
                <p className="text-white/80 text-sm">
                  Immagini di qualità professionale pronte per ogni uso
                </p>
              </div>
              
              <div className="glass-effect rounded-2xl p-6 text-center text-white">
                <Zap className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                <h3 className="font-bold text-lg mb-2">Risultati Istantanei</h3>
                <p className="text-white/80 text-sm">
                  Generazione in pochi secondi con tecnologia avanzata
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OvenVisualizer;