
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface GenerateImageParams {
  positivePrompt: string;
}

export interface GeneratedImage {
  imageURL: string;
  success: boolean;
}

export class StabilityService {
  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    try {
      console.log("Chiamata a Stability AI con prompt:", params.positivePrompt);

      const { data, error } = await supabase.functions.invoke('generate-image-stability', {
        body: {
          prompt: params.positivePrompt
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
