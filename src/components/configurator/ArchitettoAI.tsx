import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, Sparkles, Download, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CreativeLoader from "@/components/oven-visualizer/CreativeLoader";

interface ArchitettoAIProps {
  ovenName: string;
  ovenImageUrl: string;
}

const ArchitettoAI = ({ ovenName, ovenImageUrl }: ArchitettoAIProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedImageUrl(""); // Reset generated image
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      toast.error("Carica prima una foto del tuo ambiente");
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log("🏗️ Inizio generazione Architetto AI");
      
      // Convert images to base64
      const spaceImageBase64 = await convertFileToBase64(selectedImage);
      const ovenImageBase64 = await fetchUrlToBase64(ovenImageUrl);

      console.log("📸 Immagini convertite, chiamo edge function...");

      // Call edge function
      const { data, error } = await supabase.functions.invoke('generate-oven-space', {
        body: {
          spaceImage: spaceImageBase64,
          ovenType: ovenName,
          ovenModel: ovenName,
          ovenImage: ovenImageBase64
        }
      });

      if (error) throw error;

      if (data?.success && data?.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        toast.success("Render generato con successo!");
      } else {
        throw new Error(data?.error || 'Errore nella generazione');
      }
    } catch (error) {
      console.error("❌ Errore generazione:", error);
      toast.error("Errore nella generazione del render");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `${ovenName}-architetto-ai.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download avviato!");
  };

  return (
    <>
      {isGenerating && <CreativeLoader />}

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Architetto AI
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Inserisci il forno nel tuo ambiente con l'intelligenza artificiale
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Image Upload Section */}
          {!previewUrl ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                onClick={() => cameraInputRef.current?.click()}
                variant="outline"
                size="lg"
                className="w-full h-32 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 text-primary" />
                  <span className="font-medium">Scatta una Foto</span>
                  <span className="text-xs text-muted-foreground">Usa la fotocamera</span>
                </div>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">oppure</span>
                </div>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="lg"
                className="w-full h-32 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-primary" />
                  <span className="font-medium">Carica Immagine</span>
                  <span className="text-xs text-muted-foreground">Dal tuo dispositivo</span>
                </div>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Preview */}
              <div className="relative rounded-lg overflow-hidden border-2 border-primary/20">
                <img 
                  src={previewUrl} 
                  alt="Anteprima ambiente" 
                  className="w-full h-64 object-cover"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewUrl("");
                    setGeneratedImageUrl("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Cambia Foto
                </Button>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generazione...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Genera
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Generated Result */}
          {generatedImageUrl && (
            <div className="space-y-4 pt-4">
              <div className="relative rounded-lg overflow-hidden bg-gradient-to-b from-background to-muted/20 p-6">
                <img 
                  src={generatedImageUrl} 
                  alt="Render generato Architetto AI" 
                  className="w-full h-auto object-contain"
                />
              </div>
              
              <Button 
                onClick={downloadImage}
                size="lg"
                className="w-full gap-2"
              >
                <Download className="w-5 h-5" />
                Scarica Immagine HD
              </Button>

              {/* Info Badges */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">🏗️</div>
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400">Architetto</div>
                  <div className="text-[10px] text-muted-foreground">Design AI</div>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-xs font-medium text-cyan-600 dark:text-cyan-400">Preciso</div>
                  <div className="text-[10px] text-muted-foreground">Prospettiva Reale</div>
                </div>
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">✨</div>
                  <div className="text-xs font-medium text-pink-600 dark:text-pink-400">Smart</div>
                  <div className="text-[10px] text-muted-foreground">Integrazione AI</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ArchitettoAI;
