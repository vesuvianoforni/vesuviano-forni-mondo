import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Check } from "lucide-react";
import { toast } from "sonner";

export const ModelUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const uploadFile = async (file: File, modelName: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${modelName}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('3d-models')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('3d-models')
        .getPublicUrl(fileName);

      console.log(`Modello ${modelName} caricato:`, publicUrl.publicUrl);
      setUploadedFiles(prev => [...prev, fileName]);
      toast.success(`${modelName} caricato con successo!`);
      
      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Errore upload:', error);
      toast.error(`Errore caricamento ${modelName}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, modelName: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    await uploadFile(file, modelName);
    setUploading(false);
  };

  const models = [
    { key: 'cabin-mosaic', name: 'CABIN MOSAIC (VesuvioBuono)' },
    { key: 'black-mosaic', name: 'BLACK MOSAIC (Palladiana)' },
    { key: 'mosaic', name: 'MOSAIC (Mosaico)' },
    { key: 'metal', name: 'METAL (Doghe Metalliche)' }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Carica Modelli 3D Predefiniti</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {models.map((model) => (
          <div key={model.key} className="flex items-center justify-between p-4 border rounded-lg">
            <span className="font-medium">{model.name}</span>
            <div className="flex items-center gap-2">
              {uploadedFiles.includes(`${model.key}.obj`) || uploadedFiles.includes(`${model.key}.fbx`) ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <>
                  <input
                    type="file"
                    accept=".obj,.fbx"
                    onChange={(e) => handleFileUpload(e, model.key)}
                    disabled={uploading}
                    className="hidden"
                    id={`upload-${model.key}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => document.getElementById(`upload-${model.key}`)?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Carica
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ModelUploader;