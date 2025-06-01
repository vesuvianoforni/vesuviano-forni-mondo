
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, Eye, Download } from "lucide-react";
import { toast } from "sonner";

const OvenVisualizer = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedOvenType, setSelectedOvenType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");

  const ovenTypes = [
    { value: "traditional", label: "Forno Tradizionale a Legna" },
    { value: "gas", label: "Forno a Gas" },
    { value: "electric", label: "Forno Elettrico" },
    { value: "rotating", label: "Forno Rotante" }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedImage(""); // Reset generated image
    }
  };

  const generateVisualization = async () => {
    if (!selectedImage || !selectedOvenType) {
      toast.error("Seleziona un'immagine e un tipo di forno");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulazione della generazione AI
      // In produzione, qui integreresti l'API di Runware o simili
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Per ora usiamo un'immagine di esempio
      setGeneratedImage("/lovable-uploads/83490d78-6935-41ab-bb12-49e6070f44db.png");
      
      toast.success("Visualizzazione generata con successo!");
    } catch (error) {
      toast.error("Errore nella generazione. Riprova.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-stone-50 py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block bg-vesuviano-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              Innovazione AI
            </div>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-4">
              Visualizza il Tuo <span className="text-vesuviano-600">Forno Ideale</span>
            </h2>
            <p className="font-inter text-lg text-stone-600 max-w-3xl mx-auto">
              Carica una foto della tua cucina e scopri come apparirà un forno Vesuviano nel tuo spazio. 
              La nostra tecnologia AI creerà una simulazione realistica personalizzata per te.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-vesuviano-500" />
                  Carica la Tua Cucina
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <div>
                  <Label htmlFor="kitchen-image" className="text-sm font-medium text-stone-700">
                    Foto della Cucina
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="kitchen-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-vesuviano-50 file:text-vesuviano-700 hover:file:bg-vesuviano-100"
                    />
                  </div>
                  {previewUrl && (
                    <div className="mt-4">
                      <img 
                        src={previewUrl} 
                        alt="Preview cucina" 
                        className="w-full h-48 object-cover rounded-lg border border-stone-200"
                      />
                    </div>
                  )}
                </div>

                {/* Oven Type Selection */}
                <div>
                  <Label htmlFor="oven-type" className="text-sm font-medium text-stone-700">
                    Tipo di Forno
                  </Label>
                  <Select value={selectedOvenType} onValueChange={setSelectedOvenType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Seleziona il tipo di forno" />
                    </SelectTrigger>
                    <SelectContent>
                      {ovenTypes.map((oven) => (
                        <SelectItem key={oven.value} value={oven.value}>
                          {oven.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={generateVisualization}
                  disabled={!selectedImage || !selectedOvenType || isGenerating}
                  className="w-full bg-vesuviano-500 hover:bg-vesuviano-600 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generazione in corso...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Genera Visualizzazione
                    </>
                  )}
                </Button>

                <p className="text-xs text-stone-500 text-center">
                  La generazione richiede circa 30-60 secondi. L'immagine sarà ottimizzata per il tuo spazio.
                </p>
              </CardContent>
            </Card>

            {/* Result Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-vesuviano-500" />
                  Anteprima Risultato
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!generatedImage && !isGenerating && (
                  <div className="h-96 border-2 border-dashed border-stone-300 rounded-lg flex items-center justify-center">
                    <div className="text-center text-stone-500">
                      <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">La tua visualizzazione apparirà qui</p>
                      <p className="text-sm">Carica un'immagine e seleziona un forno per iniziare</p>
                    </div>
                  </div>
                )}

                {isGenerating && (
                  <div className="h-96 border border-stone-300 rounded-lg flex items-center justify-center bg-stone-50">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-vesuviano-500" />
                      <p className="text-lg font-medium text-stone-700">Generazione in corso...</p>
                      <p className="text-sm text-stone-500">La nostra AI sta creando la tua visualizzazione personalizzata</p>
                    </div>
                  </div>
                )}

                {generatedImage && (
                  <div className="space-y-4">
                    <img 
                      src={generatedImage} 
                      alt="Forno visualizzato nella cucina" 
                      className="w-full h-96 object-cover rounded-lg border border-stone-200"
                    />
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Scarica Immagine
                      </Button>
                      <Button 
                        className="flex-1 bg-vesuviano-500 hover:bg-vesuviano-600"
                        onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Richiedi Preventivo
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl p-8 border border-stone-200">
              <h3 className="font-playfair text-2xl font-bold text-charcoal-900 mb-4">
                Come Funziona la Visualizzazione AI
              </h3>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-vesuviano-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-vesuviano-600 font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-stone-900 mb-2">Carica la Foto</h4>
                  <p className="text-sm text-stone-600">Scatta o carica una foto della tua cucina o spazio di lavoro</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-vesuviano-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-vesuviano-600 font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-stone-900 mb-2">Seleziona il Forno</h4>
                  <p className="text-sm text-stone-600">Scegli il modello di forno Vesuviano che preferisci</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-vesuviano-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-vesuviano-600 font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-stone-900 mb-2">Visualizza il Risultato</h4>
                  <p className="text-sm text-stone-600">La nostra AI genera una simulazione realistica del forno nel tuo spazio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OvenVisualizer;
