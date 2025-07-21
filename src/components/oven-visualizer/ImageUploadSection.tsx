
import React from 'react';
import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadSectionProps {
  previewUrl: string;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onModelUpload?: (url: string, fileName: string) => void;
}

const ImageUploadSection = ({ previewUrl, onImageUpload, onModelUpload }: ImageUploadSectionProps) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selezionato:', file.name, 'Tipo:', file.type, 'Dimensione:', file.size);

    // Check if it's a 3D model file
    const is3DModel = ['obj', 'mtl', 'fbx', 'glb', 'gltf'].some(ext => 
      file.name.toLowerCase().endsWith(`.${ext}`)
    );

    if (is3DModel && onModelUpload) {
      try {
        toast.loading("Caricamento modello 3D in corso...");
        
        // Verifica che il bucket esista
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        console.log('Buckets disponibili:', buckets);
        
        if (bucketsError) {
          console.error('Errore nel recupero dei buckets:', bucketsError);
          throw bucketsError;
        }

        // Upload to Supabase Storage con un nome unico
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        console.log('Nome file per upload:', fileName);
        
        const { data, error } = await supabase.storage
          .from('3d-models')
          .upload(`models/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Errore upload Supabase:', error);
          throw error;
        }

        console.log('Upload completato:', data);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('3d-models')
          .getPublicUrl(data.path);

        console.log('URL pubblico generato:', publicUrl);

        // Verifica che il file sia accessibile
        try {
          const response = await fetch(publicUrl, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`File non accessibile: ${response.status}`);
          }
          console.log('File verificato e accessibile');
        } catch (verifyError) {
          console.error('Errore verifica accessibilità file:', verifyError);
          toast.error("File caricato ma non accessibile");
          return;
        }

        onModelUpload(publicUrl, file.name);
        toast.success(`Modello 3D "${file.name}" caricato con successo!`);
      } catch (error) {
        console.error('Errore completo nel caricamento:', error);
        toast.error(`Errore nel caricamento del modello 3D: ${error.message}`);
      }
    } else {
      // Handle regular image upload
      console.log('Caricamento immagine normale');
      onImageUpload(event);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Upload className="w-4 h-4 md:w-5 md:h-5 text-vesuviano-500 flex-shrink-0" />
          Carica il Tuo Modello 3D
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div>
          <Label htmlFor="kitchen-image" className="text-sm font-medium text-stone-700">
            Modello 3D del Forno (GLB, GLTF, OBJ) o Foto della Cucina
          </Label>
          <div className="mt-2">
            <Input
              id="kitchen-image"
              type="file"
              accept="image/*,.obj,.mtl,.fbx,.glb,.gltf"
              onChange={handleFileChange}
              className="text-xs md:text-sm file:mr-2 md:file:mr-4 file:py-1 md:file:py-2 file:px-2 md:file:px-4 file:rounded-full file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-vesuviano-50 file:text-vesuviano-700 hover:file:bg-vesuviano-100"
            />
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Formati supportati: GLB, GLTF (consigliati), OBJ, FBX per modelli 3D
          </p>
          {previewUrl && (
            <div className="mt-3 md:mt-4">
              <img 
                src={previewUrl} 
                alt="Preview cucina" 
                className="w-full h-32 md:h-48 object-cover rounded-lg border border-stone-200"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUploadSection;
