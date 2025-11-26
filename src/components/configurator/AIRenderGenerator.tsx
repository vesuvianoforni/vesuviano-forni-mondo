import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, Download, Loader2, Palette } from "lucide-react";
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
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [customColor, setCustomColor] = useState<string>(selectedCoating || "");

  const generateRender = async () => {
    const colorToUse = customColor.trim() || selectedCoating;
    
    if (!colorToUse) {
      toast.error("Inserisci il colore desiderato!");
      return;
    }

    setIsGenerating(true);
    
    try {
      const promptText = `Genera un render fotorealistico professionale di un forno a legna per pizza modello "${ovenName}" con finitura/rivestimento colore ${colorToUse}. Il forno deve essere mostrato in un ambiente elegante e professionale, con illuminazione da studio che ne esalti i dettagli, la texture e il colore del rivestimento. Focus sul design artigianale e sulla qualità dei materiali. Altissima risoluzione, qualità fotografica professionale, sfondo neutro o ambiente elegante.`;
      
      console.log("🚀 Generazione render AI del forno...");
      const { data, error } = await supabase.functions.invoke('generate-image-openai', {
        body: {
          prompt: promptText
        }
      });
      
      if (error) throw error;

      if (data?.imageUrl || data?.imageURL) {
        const imageUrl = data.imageUrl || data.imageURL;
        setGeneratedImageUrl(imageUrl);
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
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Genera Render AI</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Visualizza il forno con il colore/rivestimento che preferisci
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Color/Coating Selector */}
          <div className="space-y-2">
            <Label htmlFor="color-input" className="text-sm font-medium">
              Colore / Rivestimento desiderato
            </Label>
            {selectedCoating && (
              <div className="text-xs text-muted-foreground mb-2">
                Rivestimento selezionato: <span className="font-semibold text-blue-700">{selectedCoating}</span>
              </div>
            )}
            <Input
              id="color-input"
              type="text"
              placeholder="Es: Nero opaco, Mosaico rosso, Bianco lucido, Grigio antracite..."
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="bg-white border-blue-200 focus:border-blue-400"
            />
            <p className="text-xs text-muted-foreground">
              Descrivi il colore o tipo di rivestimento che vorresti vedere
            </p>
          </div>

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
            disabled={(!customColor.trim() && !selectedCoating) || isGenerating}
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
            Genera un'immagine professionale del forno personalizzato
          </p>
        </CardContent>
      </Card>
    </>
  );
};

export default AIRenderGenerator;
