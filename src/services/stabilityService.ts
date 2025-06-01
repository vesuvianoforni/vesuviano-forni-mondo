
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
        console.log("Convertendo immagine in base64...");
        imageBase64 = await this.fileToBase64(params.imageFile);
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
