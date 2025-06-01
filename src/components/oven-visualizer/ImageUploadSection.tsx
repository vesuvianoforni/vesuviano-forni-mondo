
import React from 'react';
import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadSectionProps {
  previewUrl: string;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploadSection = ({ previewUrl, onImageUpload }: ImageUploadSectionProps) => {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Upload className="w-4 h-4 md:w-5 md:h-5 text-vesuviano-500 flex-shrink-0" />
          Carica la Tua Cucina
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div>
          <Label htmlFor="kitchen-image" className="text-sm font-medium text-stone-700">
            Foto della Cucina
          </Label>
          <div className="mt-2">
            <Input
              id="kitchen-image"
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="text-xs md:text-sm file:mr-2 md:file:mr-4 file:py-1 md:file:py-2 file:px-2 md:file:px-4 file:rounded-full file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-vesuviano-50 file:text-vesuviano-700 hover:file:bg-vesuviano-100"
            />
          </div>
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
