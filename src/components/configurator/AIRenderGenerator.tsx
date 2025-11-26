import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Wand2, Download, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ImageResultModal from "@/components/oven-visualizer/ImageResultModal";
import CreativeLoader from "@/components/oven-visualizer/CreativeLoader";

interface AIRenderGeneratorProps {
  ovenName: string;
  ovenImageUrl: string;
  selectedCoating?: string;
}

const AIRenderGenerator = ({ ovenName, ovenImageUrl, selectedCoating }: AIRenderGeneratorProps) => {
  const [spaceImage, setSpaceImage] = useState<File | null>(null);
  const [spaceImagePreview, setSpaceImagePreview] = useState<string>("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSpaceImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSpaceImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Immagine caricata!");
    }
  };

  const removeImage = () => {
    setSpaceImage(null);
    setSpaceImagePreview("");
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

  const generateRender = async () => {
    if (!spaceImage) {
      toast.error("Carica prima un'immagine del tuo spazio!");
      return;
    }

    setIsGenerating(true);
    
    try {
      const base64Image = await convertFileToBase64(spaceImage);
      const ovenImageBase64 = await fetchUrlToBase64(ovenImageUrl);
      
      const coatingInfo = selectedCoating ? ` con rivestimento ${selectedCoating}` : '';
      const promptText = `Inserisci il forno "${ovenName}"${coatingInfo} nella foto caricata in fotorealismo, senza alterare la foto caricata, semplicemente inserendo il forno in modo equilibrato e naturale. Qualora ci sia già un altro forno presente nell'immagine, sostituiscilo completamente con il nostro forno selezionato. Il forno deve integrarsi perfettamente nell'ambiente rispettando prospettiva, illuminazione e ombre.`;
      
      console.log("🚀 Generazione render AI...");
      const { data, error } = await supabase.functions.invoke('generate-oven-space', {
        body: {
          spaceImage: base64Image,
          ovenType: ovenName,
          ovenModel: ovenName + coatingInfo,
          ovenImage: ovenImageBase64
        }
      });
      
      if (error) throw error;

      if (data?.success && data?.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setShowResultModal(true);
        toast.success("Render generato con successo!");
      } else {
        throw new Error(data?.error || 'Errore nella generazione');
      }
    } catch (error: any) {
      console.error('Errore generazione render:', error);
      toast.error(`Errore: ${error?.message || 'Impossibile generare il render'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `render-${ovenName}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download avviato!");
  };

  return (
    <>
      {isGenerating && <CreativeLoader />}

      <ImageResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        imageUrl={generatedImageUrl}
        ovenModel={ovenName + (selectedCoating ? ` - ${selectedCoating}` : '')}
        onDownload={downloadImage}
      />

      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Visualizza con AI</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Carica una foto del tuo spazio e genera un render fotorealistico
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          {!spaceImagePreview ? (
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-white/50 hover:border-blue-400 hover:bg-white/70 transition-all">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="space-upload"
              />
              <label htmlFor="space-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <p className="font-medium text-stone-900 mb-1">Carica foto del tuo spazio</p>
                <p className="text-sm text-muted-foreground">
                  Cucina, giardino, locale commerciale...
                </p>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={spaceImagePreview} 
                alt="Spazio caricato" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Generated Result */}
          {generatedImageUrl && (
            <div className="space-y-3">
              <div className="relative">
                <img 
                  src={generatedImageUrl} 
                  alt="Render generato" 
                  className="w-full h-64 object-contain rounded-lg border-2 border-green-300 bg-white"
                />
              </div>
              <Button 
                onClick={downloadImage}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Scarica Render
              </Button>
            </div>
          )}

          {/* Generate Button */}
          <Button 
            onClick={generateRender}
            disabled={!spaceImage || isGenerating}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generazione in corso...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Genera Render AI
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            La generazione richiede circa 10-30 secondi
          </p>
        </CardContent>
      </Card>
    </>
  );
};

export default AIRenderGenerator;
