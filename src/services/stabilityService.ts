
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface GenerateImageParams {
  positivePrompt: string;
  imageFile?: File;
}

export interface GeneratedImage {
  imageURL: string;
  success: boolean;
}

export class StabilityService {
  private async resizeImage(file: File, maxSize: number = 1024): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcola le nuove dimensioni mantenendo le proporzioni e adattandole ai formati SDXL consentiti
        let { width, height } = img;

        // Formati consentiti da SDXL
        const allowed = [
          { w: 1024, h: 1024 },
          { w: 1152, h: 896 },
          { w: 1216, h: 832 },
          { w: 1344, h: 768 },
          { w: 1536, h: 640 },
          { w: 640, h: 1536 },
          { w: 768, h: 1344 },
          { w: 832, h: 1216 },
          { w: 896, h: 1152 },
        ];

        const ar = width / height;
        const orientation = width >= height ? 'landscape' : 'portrait';
        const candidates = allowed.filter(s => (orientation === 'landscape' ? s.w >= s.h : s.h > s.w));

        // Scegli il formato con aspect ratio più vicino
        let target = candidates[0];
        let bestDiff = Infinity;
        for (const s of candidates) {
          const diff = Math.abs((s.w / s.h) - ar);
          if (diff < bestDiff) {
            bestDiff = diff;
            target = s;
          }
        }

        width = target.w;
        height = target.h;

        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: 'image/png',
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Errore nel ridimensionamento dell\'immagine'));
          }
        }, 'image/png', 0.9);
      };
      
      img.onerror = () => reject(new Error('Errore nel caricamento dell\'immagine'));
      img.src = URL.createObjectURL(file);
    });
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    try {
      console.log("Chiamata a Stability AI con prompt:", params.positivePrompt);

      let imageBase64 = null;
      if (params.imageFile) {
        console.log("Ridimensionando immagine per compatibilità con Stability AI...");
        const resizedImage = await this.resizeImage(params.imageFile, 1024);
        console.log("Immagine ridimensionata, convertendo in base64...");
        imageBase64 = await this.fileToBase64(resizedImage);
      }

      const { data, error } = await supabase.functions.invoke('generate-image-stability', {
        body: {
          prompt: params.positivePrompt,
          imageBase64: imageBase64
        }
      });

      if (error) {
        console.error("Errore Supabase function:", error);
        throw new Error(error.message || "Errore nella chiamata alla funzione");
      }

      if (!data || !data.imageURL) {
        throw new Error("Nessuna immagine ricevuta dalla risposta");
      }

      return {
        imageURL: data.imageURL,
        success: true
      };

    } catch (error) {
      console.error("Errore StabilityService:", error);
      toast.error("Errore nella generazione dell'immagine");
      throw error;
    }
  }
}
