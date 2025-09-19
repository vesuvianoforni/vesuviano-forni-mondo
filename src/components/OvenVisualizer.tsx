import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Wand2, Smartphone, Camera, Zap, Brain, Eye, Image as ImageIcon, X, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StabilityService } from "@/services/stabilityService";
import ARVisualizer from './oven-visualizer/ARVisualizer';
import CreativeLoader from './oven-visualizer/CreativeLoader';
import ImageResultModal from './oven-visualizer/ImageResultModal';
import DownloadModal from './oven-visualizer/DownloadModal';
import { OvenType } from './oven-visualizer/OvenTypeSelector';

interface OvenData {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  coating_type?: string;
  image_url: string;
  description?: string;
  specifications?: any;
}

const OvenVisualizer = () => {
  const { t } = useTranslation();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedOvenType, setSelectedOvenType] = useState<string>("");
  const [showARVisualizer, setShowARVisualizer] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'ai' | 'ar' | null>(null);
  const [ovens, setOvens] = useState<OvenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllOvens, setShowAllOvens] = useState(false);

  // Load ovens from Supabase
  useEffect(() => {
    const loadOvens = async () => {
      try {
        const { data, error } = await supabase
          .from('ovens')
          .select('*')
          .order('category', { ascending: true });
        
        if (error) throw error;
        
        setOvens(data || []);
      } catch (error) {
        console.error('Error loading ovens:', error);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    loadOvens();
  }, []);

  // AR-specific oven types for visualization
  const ovenTypes: OvenType[] = [
    { 
      value: "vesuviobuono", 
      label: "VesuvioBuono (Con depuratore fumi)",
      image: "/lovable-uploads/vesuviobuono-ar.jpg",
      modelKey: "CABIN_MOSAIC_v001"
    },
    { 
      value: "tradizionale", 
      label: "Tradizionale a cupola",
      image: "/lovable-uploads/tradizionale-cupola-ar.jpg",
      modelKey: "BLACK_MOSAIC_v001"
    },
    { 
      value: "metallico", 
      label: "Metallico di design",
      image: "/lovable-uploads/metallico-design-ar.jpg",
      modelKey: "METAL_v001"
    }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files].slice(0, 3)); // Max 3 images
      toast.success(`${files.length} ${t('ovenVisualizer.alerts.imagesUploaded')}`);
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
    console.log("🔧 Inizio generazione AI - Architetto AI");
    console.log("📸 Immagini selezionate:", selectedImages.length);
    console.log("🏺 Forno selezionato:", selectedOvenType);
    
    if (selectedImages.length === 0 || !selectedOvenType) {
      console.error("❌ Validazione fallita - mancano immagini o forno");
      toast.error(t('ovenVisualizer.alerts.uploadImages'));
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log("🖼️ Conversione immagine principale...");
      const mainImage = selectedImages[0]; // Use first image as main
      const base64Image = await convertFileToBase64(mainImage);
      console.log("✅ Immagine convertita in base64, dimensione:", base64Image.length);
      
      // Get selected oven data from Supabase or fallback
      console.log("🔍 Cerco dati forno...");
      const selectedOvenData = ovens.find(oven => oven.id === selectedOvenType) || 
                               ovenTypes.find(oven => oven.value === selectedOvenType);
      console.log("📋 Dati forno trovati:", selectedOvenData);
      
      if (!selectedOvenData) {
        throw new Error("Dati del forno selezionato non trovati");
      }
      
      const ovenRefUrl = ('image_url' in selectedOvenData ? selectedOvenData.image_url : selectedOvenData.image) || '';
      console.log("🏺 URL immagine forno:", ovenRefUrl);
      
      const ovenImageBase64 = ovenRefUrl ? await fetchUrlToBase64(ovenRefUrl) : undefined;
      console.log("🏺 Immagine forno convertita:", !!ovenImageBase64);
      
      const ovenName = ('name' in selectedOvenData ? selectedOvenData.name : selectedOvenData.label) || 'forno a legna';
      console.log("📝 Nome forno:", ovenName);
      
      const promptText = `Inserisci il forno selezionato "${ovenName}" nella foto caricata in fotorealismo, senza alterare la foto caricata, semplicemente inserendo il forno in modo equilibrato e naturale. Il forno deve integrarsi perfettamente nell'ambiente rispettando prospettiva, illuminazione e ombre.`;
      console.log("💬 Prompt generato:", promptText);
      
      // 1) Prova con Gemini (edge function)
      console.log("🚀 Chiamata a Gemini via Supabase function...");
      const { data, error } = await supabase.functions.invoke('generate-oven-space', {
        body: {
          spaceImage: base64Image,
          ovenType: selectedOvenType,
          ovenModel: ovenName,
          ovenImage: ovenImageBase64
        }
      });
      
      console.log("📞 Risposta Gemini - error:", error);
      console.log("📞 Risposta Gemini - data:", data);

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
      toast.error(t('ovenVisualizer.alerts.selectOven'));
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error(t('ovenVisualizer.alerts.cameraNotSupported'));
      return;
    }

    setShowARVisualizer(true);
    toast.success(t('ovenVisualizer.alerts.arStarted'));
  };

  const selectedOvenData = ovens.find(oven => oven.id === selectedOvenType) || 
                       ovenTypes.find(oven => oven.value === selectedOvenType);

  return (
    <>
      {/* Loading Overlay */}
      {isGenerating && <CreativeLoader />}

      {/* Result Modal */}
      <ImageResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        imageUrl={generatedImageUrl}
        ovenModel={selectedOvenData ? ('name' in selectedOvenData ? selectedOvenData.name : selectedOvenData.label) : ''}
        onDownload={() => {
          console.log("🔽 Apertura Download Modal...");
          setShowResultModal(false);
          setShowDownloadModal(true);
        }}
      />

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => {
          console.log("🔄 Chiusura Download Modal...");
          setShowDownloadModal(false);
        }}
        imageUrl={generatedImageUrl}
        ovenModel={selectedOvenData ? ('name' in selectedOvenData ? selectedOvenData.name : selectedOvenData.label) : ''}
      />

      {/* AR Visualizer */}
      {showARVisualizer && (
        <ARVisualizer
          selectedOvenType={selectedOvenType}
          ovenTypes={ovenTypes}
          onClose={() => setShowARVisualizer(false)}
          onOvenTypeChange={setSelectedOvenType}
          uploadedModel={null}
        />
      )}
      
      {/* Main Section */}
      <section id="ai-architect" className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            {/* New Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
              <span>{t('ovenVisualizer.badge')}</span>
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              {t('ovenVisualizer.title')}
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-8">
              {t('ovenVisualizer.subtitle')}
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
                    <Wand2 className={`w-6 h-6 ${selectedMode === 'ai' ? 'text-white' : 'text-stone-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">
                      {t('ovenVisualizer.aiMode.title')}
                    </h3>
                    <p className="text-stone-600 text-sm mb-3">
                      {t('ovenVisualizer.aiMode.description')}
                    </p>
                    <div className="space-y-2 text-xs text-stone-500">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>{t('ovenVisualizer.aiMode.features.photorealistic')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>{t('ovenVisualizer.aiMode.features.lighting')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>{t('ovenVisualizer.aiMode.features.highRes')}</span>
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
                      {t('ovenVisualizer.arMode.title')}
                    </h3>
                    <p className="text-stone-600 text-sm mb-3">
                      {t('ovenVisualizer.arMode.description')}
                    </p>
                    <div className="space-y-2 text-xs text-stone-500">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>{t('ovenVisualizer.arMode.features.interactive')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>{t('ovenVisualizer.arMode.features.realtime')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>{t('ovenVisualizer.arMode.features.compatible')}</span>
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

          {/* Content sections that appear below selected mode */}
          {selectedMode && (
            <div className="mt-8">
              {selectedMode === 'ai' && (
                <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 md:p-8">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Wand2 className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-stone-900 mb-1">{t('ovenVisualizer.aiMode.title')}</h2>
                      <p className="text-stone-600 text-sm">{t('ovenVisualizer.aiMode.uploadDescription')}</p>
                    </div>

                    <div className="space-y-6">
                      {/* Image Upload */}
                      <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 md:p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                          <p className="font-medium text-stone-900 text-sm mb-1">{t('ovenVisualizer.aiMode.uploadTitle')}</p>
                          <p className="text-xs text-stone-600">{t('ovenVisualizer.aiMode.uploadSubtitle')}</p>
                        </label>
                      </div>

                      {/* Image Preview */}
                      {selectedImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {selectedImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Oven Selection - Limita forni mostrati su mobile */}
                      <div>
                        <h3 className="font-semibold text-stone-900 mb-3 text-sm">Scegli il forno</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {(showAllOvens ? ovens : ovens.slice(0, 4)).map((oven) => (
                            <button
                              key={oven.id}
                              onClick={() => setSelectedOvenType(oven.id)}
                              className={`relative overflow-hidden rounded-lg border-2 transition-all group ${
                                selectedOvenType === oven.id
                                  ? 'border-blue-500 ring-2 ring-blue-200 transform scale-[1.02]'
                                  : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center p-3">
                                <div className="w-16 h-16 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                                  <img
                                    src={oven.image_url}
                                    alt={oven.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 text-left">
                                  <h4 className="font-medium text-sm text-stone-900 mb-1">
                                    {oven.name}
                                  </h4>
                                  <p className="text-xs text-stone-600">
                                    {oven.description ? oven.description.substring(0, 50) + '...' : oven.category}
                                  </p>
                                </div>
                                {selectedOvenType === oven.id && (
                                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                        
                        {/* Mostra più modelli button */}
                        {!showAllOvens && ovens.length > 4 && (
                          <div className="mt-3 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAllOvens(true)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Mostra più modelli ({ovens.length - 4})
                            </Button>
                          </div>
                        )}
                        
                        {/* Mostra meno modelli button */}
                        {showAllOvens && ovens.length > 4 && (
                          <div className="mt-3 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAllOvens(false)}
                              className="text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                            >
                              <Minus className="w-4 h-4 mr-1" />
                              Mostra meno modelli
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Generate Button */}
                      <Button
                        onClick={generateOvenInSpace}
                        disabled={selectedImages.length === 0 || !selectedOvenType || isGenerating}
                        className={`w-full py-3 font-semibold rounded-xl transition-all duration-300 ${
                          isGenerating
                            ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse'
                            : 'bg-primary hover:bg-primary/90 text-white'
                        }`}
                      >
                        {isGenerating ? (
                          <div className="flex items-center justify-center space-x-3">
                            <div className="relative">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            </div>
                            <span className="text-white text-sm">Generando con AI...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <Wand2 className="w-4 h-4" />
                            <span className="text-sm">Genera Immagine AI</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedMode === 'ar' && (
                <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 md:p-8">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-stone-900 mb-1">Realtà Aumentata</h2>
                      <p className="text-stone-600 text-sm">Visualizzazione 3D in tempo reale</p>
                    </div>

                    <div className="space-y-6">
                      {/* Oven Selection for AR - Solo i 3 modelli AR */}
                      <div>
                        <h3 className="font-semibold text-stone-900 mb-3 text-sm">Scegli il forno per l'AR</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {ovenTypes.map((oven) => (
                            <button
                              key={oven.value}
                              onClick={() => setSelectedOvenType(oven.value)}
                              className={`relative overflow-hidden rounded-lg border-2 transition-all group ${
                                selectedOvenType === oven.value
                                  ? 'border-emerald-500 ring-2 ring-emerald-200 transform scale-[1.02]'
                                  : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center p-3">
                                <div className="w-16 h-16 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                                  <img
                                    src={oven.image}
                                    alt={oven.label}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 text-left">
                                  <h4 className="font-medium text-sm text-stone-900 mb-1">
                                    {oven.label.split(' (')[0]}
                                  </h4>
                                  <p className="text-xs text-stone-600">
                                    {oven.label.includes('(') ? oven.label.split('(')[1]?.replace(')', '') : 'Forno tradizionale'}
                                  </p>
                                </div>
                                {selectedOvenType === oven.value && (
                                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* AR Features */}
                      <div className="bg-stone-50 rounded-xl p-4">
                        <h4 className="font-medium text-stone-900 mb-3 text-sm">Cosa puoi fare con l'AR:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Camera className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-xs text-stone-700">Usa la fotocamera per vedere il forno nel tuo spazio</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Smartphone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-xs text-stone-700">Tocca e trascina per posizionare il forno</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-xs text-stone-700">Ruota e ridimensiona in tempo reale</span>
                          </div>
                        </div>
                      </div>

                      {/* AR Button */}
                      <Button
                        onClick={startARVisualization}
                        disabled={!selectedOvenType}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 font-semibold rounded-xl transition-all duration-300"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Camera className="w-4 h-4" />
                          <span className="text-sm">Avvia Modalità AR</span>
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