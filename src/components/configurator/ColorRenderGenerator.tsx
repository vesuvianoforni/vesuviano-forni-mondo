import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Download, Loader2, Palette, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CreativeLoader from "@/components/oven-visualizer/CreativeLoader";

interface ColorRenderGeneratorProps {
  ovenName: string;
  ovenImageUrl: string;
  selectedCoating?: string;
}

const POPULAR_COLORS = [
  { name: "Nero", color: "#000000" },
  { name: "Bianco", color: "#FFFFFF" },
  { name: "Rosso Mattone", color: "#8B4513" },
  { name: "Grigio Pietra", color: "#708090" },
  { name: "Terracotta", color: "#E07856" },
  { name: "Beige", color: "#C8B89A" },
  { name: "Marrone", color: "#5D4037" },
  { name: "Verde Oliva", color: "#556B2F" },
];

const ColorRenderGenerator = ({ ovenName, ovenImageUrl, selectedCoating }: ColorRenderGeneratorProps) => {
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(selectedCoating || "");

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
    const colorToUse = selectedColor;
    
    if (!colorToUse) {
      toast.error("Seleziona un colore/rivestimento!");
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log("🚀 Generazione render real time del forno con colore:", colorToUse);
      const { data, error } = await supabase.functions.invoke('generate-oven-render', {
        body: {
          ovenName,
          color: colorToUse,
          imageUrl: ovenImageUrl
        }
      });
      
      if (error) throw error;

      if (data?.imageUrl || data?.imageURL) {
        const imageUrl = data.imageUrl || data.imageURL;
        setGeneratedImageUrl(imageUrl);
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

  return (
    <>
      {isGenerating && <CreativeLoader />}

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Palette className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">Render Real Time</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visualizza il forno con il colore selezionato in tempo reale
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Coating Display */}
          {selectedCoating && (
            <div className="bg-background/80 border rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">
                Rivestimento selezionato:
              </p>
              <p className="text-primary text-sm font-semibold">
                {selectedCoating}
              </p>
            </div>
          )}

          {/* Color Selection Grid */}
          <div className="space-y-3">
            <p className="text-sm font-medium">
              Colore desiderato
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {POPULAR_COLORS.map((colorOption) => (
                <button
                  key={colorOption.name}
                  onClick={() => setSelectedColor(colorOption.name)}
                  className={`relative p-3 border-2 rounded-lg transition-all hover:scale-105 ${
                    selectedColor === colorOption.name
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded-full border-2 border-background shadow-md"
                      style={{ backgroundColor: colorOption.color }}
                    />
                    <span className="text-xs font-medium text-center leading-tight">
                      {colorOption.name}
                    </span>
                  </div>
                  {selectedColor === colorOption.name && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Selected Color Display */}
            {selectedColor && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    Selezionato: <span className="font-semibold text-primary">{selectedColor}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Generated Result */}
          {generatedImageUrl && (
            <div className="space-y-4 pt-4">
              <div className="relative rounded-lg overflow-hidden bg-gradient-to-b from-background to-muted/20 p-6">
                <img 
                  src={generatedImageUrl} 
                  alt="Render generato" 
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
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400">AI</div>
                  <div className="text-[10px] text-muted-foreground">Intelligenza Artificiale</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">✨</div>
                  <div className="text-xs font-medium text-green-600 dark:text-green-400">HD</div>
                  <div className="text-[10px] text-muted-foreground">Alta Risoluzione</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-xs font-medium text-orange-600 dark:text-orange-400">Real</div>
                  <div className="text-[10px] text-muted-foreground">Fotorealistico</div>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button 
            onClick={generateRender}
            disabled={!selectedColor || isGenerating}
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
                Genera Render Real Time
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Visualizza il render del forno nel colore selezionato
          </p>
        </CardContent>
      </Card>
    </>
  );
};

export default ColorRenderGenerator;
