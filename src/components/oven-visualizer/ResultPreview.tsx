
import React from 'react';
import { Eye, Download, Loader2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OvenType } from './OvenTypeSelector';

interface ResultPreviewProps {
  generatedImage: string;
  isGenerating: boolean;
  selectedOvenData: OvenType | undefined;
  onDownload: () => void;
}

const ResultPreview = ({ generatedImage, isGenerating, selectedOvenData, onDownload }: ResultPreviewProps) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Eye className="w-4 h-4 md:w-5 md:h-5 text-vesuviano-500 flex-shrink-0" />
          Anteprima Risultato
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!generatedImage && !isGenerating && (
          <div className="h-64 md:h-96 border-2 border-dashed border-stone-300 rounded-lg flex items-center justify-center">
            <div className="text-center text-stone-500 px-4">
              <Upload className="w-8 md:w-12 h-8 md:h-12 mx-auto mb-3 md:mb-4 opacity-50" />
              <p className="text-base md:text-lg font-medium">La tua visualizzazione apparirà qui</p>
              <p className="text-xs md:text-sm mt-1">Carica un'immagine e seleziona un forno per iniziare</p>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="h-64 md:h-96 border border-stone-300 rounded-lg flex items-center justify-center bg-stone-50">
            <div className="text-center px-4">
              <Loader2 className="w-8 md:w-12 h-8 md:h-12 mx-auto mb-3 md:mb-4 animate-spin text-vesuviano-500" />
              <p className="text-base md:text-lg font-medium text-stone-700">Generazione in corso...</p>
              <p className="text-xs md:text-sm text-stone-500 mt-1">La nostra AI sta creando la tua visualizzazione personalizzata</p>
              <div className="mt-3 md:mt-4 text-xs text-stone-400">
                Integrando il forno {selectedOvenData?.label} nella tua cucina...
              </div>
            </div>
          </div>
        )}

        {generatedImage && (
          <div className="space-y-3 md:space-y-4">
            <img 
              src={generatedImage} 
              alt="Forno visualizzato nella cucina" 
              className="w-full h-64 md:h-96 object-contain rounded-lg border border-stone-200 bg-white"
            />
            <div className="bg-vesuviano-50 p-3 md:p-4 rounded-lg">
              <p className="text-sm font-medium text-vesuviano-800 mb-1">
                Modello: {selectedOvenData?.label}
              </p>
              <p className="text-xs text-vesuviano-600">
                Simulazione completata - Questa è un'anteprima di come apparirà il tuo forno
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button 
                variant="outline" 
                onClick={onDownload}
                className="flex-1 text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Scarica Immagine
              </Button>
              <Button 
                className="flex-1 bg-vesuviano-500 hover:bg-vesuviano-600 text-sm"
                onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Richiedi Preventivo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultPreview;
