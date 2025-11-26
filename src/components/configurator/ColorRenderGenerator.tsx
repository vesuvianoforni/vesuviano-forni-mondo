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

interface ColorRenderGeneratorProps {
  ovenName: string;
  ovenImageUrl: string;
  selectedCoating?: string;
}

const ColorRenderGenerator = ({ ovenName, ovenImageUrl, selectedCoating }: ColorRenderGeneratorProps) => {
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [customColor, setCustomColor] = useState<string>("");

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

  const generateRender = async () => {
    const colorToUse = customColor.trim() || selectedCoating;
    
    if (!colorToUse) {
      toast.error("Seleziona o inserisci un colore/rivestimento!");
      return;
    }

    setIsGenerating(true);
    
    try {
      const promptText = `Genera un render fotorealistico professionale di un forno a legna per pizza modello "${ovenName}" con finitura/rivestimento "${colorToUse}". Il forno deve essere mostrato in un ambiente elegante e professionale, con illuminazione da studio che ne esalti i dettagli, la texture e il colore del rivestimento. Focus sul design artigianale italiano e sulla qualità dei materiali. Altissima risoluzione, qualità fotografica professionale, sfondo neutro elegante.`;
      
      console.log("🚀 Generazione render AI del forno con colore:", colorToUse);
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

  const displayColor = customColor.trim() || selectedCoating || "";

  return (
    <>
      {isGenerating && <CreativeLoader />}

      <ImageResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        imageUrl={generatedImageUrl}
        ovenModel={`${ovenName} - ${displayColor}`}
        onDownload={downloadImage}
      />

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Palette className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">Genera Render AI</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visualizza il forno con il rivestimento selezionato in alta qualità
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Coating Display */}
          {selectedCoating && !customColor && (
            <div className="bg-background/80 border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Palette className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Rivestimento selezionato
                  </p>
                  <p className="text-primary text-base font-semibold">
                    {selectedCoating}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clicca "Genera" per vedere un render professionale
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Custom Color Input */}
          <div className="space-y-2">
            <Label htmlFor="custom-color" className="text-sm font-medium">
              Preferisci un altro colore? (opzionale)
            </Label>
            <Input
              id="custom-color"
              type="text"
              placeholder="Es: Rosso mattone, Grigio pietra, Bianco lucido..."
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Lascia vuoto per usare il rivestimento selezionato
            </p>
          </div>

          {/* Generated Result */}
          {generatedImageUrl && (
            <div className="space-y-3 pt-2">
              <div className="relative rounded-lg overflow-hidden border-2 border-green-300">
                <img 
                  src={generatedImageUrl} 
                  alt="Render generato" 
                  className="w-full h-64 object-contain bg-white"
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
            disabled={(!displayColor) || isGenerating}
            className="w-full"
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

export default ColorRenderGenerator;
