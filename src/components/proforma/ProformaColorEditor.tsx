import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

interface ProformaColorEditorProps {
  item: {
    id: string;
    model_name: string | null;
    image_url: string | null;
  };
  onClose: () => void;
  onRenderGenerated: (imageUrl: string) => void;
}

const ProformaColorEditor = ({ item, onClose, onRenderGenerated }: ProformaColorEditorProps) => {
  const [selectedColor, setSelectedColor] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');

  const generateRender = async () => {
    const colorName = customColor || selectedColor;
    if (!colorName || !item.image_url) {
      toast.error('Seleziona un colore');
      return;
    }

    setIsGenerating(true);
    try {
      const baseUrl = window.location.origin;
      const fullImageUrl = item.image_url.startsWith('http')
        ? item.image_url
        : `${baseUrl}${item.image_url}`;

      const { data, error } = await supabase.functions.invoke('generate-oven-render', {
        body: {
          ovenName: item.model_name || 'Forno',
          color: colorName,
          imageUrl: fullImageUrl,
        }
      });

      if (error) throw error;

      const imageUrl = data?.imageUrl || data?.imageURL;
      if (!imageUrl) throw new Error('Nessuna immagine generata');

      setGeneratedUrl(imageUrl);
    } catch (error: any) {
      console.error('Render error:', error);
      toast.error('Errore nella generazione del render');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#222] text-white border-amber-900/30">
        <DialogHeader>
          <DialogTitle className="text-amber-100">
            Personalizza Colore — {item.model_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Color Palette */}
          <div>
            <Label className="text-gray-300">Scegli un colore</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {POPULAR_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => { setSelectedColor(c.name); setCustomColor(''); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    selectedColor === c.name
                      ? 'border-amber-500 bg-amber-900/30'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border border-gray-600"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-sm">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Oppure scrivi un colore personalizzato</Label>
            <Input
              value={customColor}
              onChange={(e) => { setCustomColor(e.target.value); setSelectedColor(''); }}
              placeholder="Es. Blu Oceano, Rosa Cipria..."
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
          </div>

          {/* Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400 text-xs">Originale</Label>
              <img src={item.image_url || ''} alt="Original" className="rounded-lg w-full mt-1" />
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Render</Label>
              {generatedUrl ? (
                <img src={generatedUrl} alt="Render" className="rounded-lg w-full mt-1" />
              ) : (
                <div className="w-full aspect-square bg-[#1a1a1a] rounded-lg mt-1 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">Genera un render</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generateRender}
              disabled={isGenerating || (!selectedColor && !customColor)}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Generazione...' : 'Genera Render'}
            </Button>
            {generatedUrl && (
              <Button
                onClick={() => onRenderGenerated(generatedUrl)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" /> Conferma
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProformaColorEditor;
