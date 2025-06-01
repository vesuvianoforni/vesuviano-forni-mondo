
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, imageBase64 } = await req.json();
    
    console.log('=== INIZIO RICHIESTA ControlNet ===');
    console.log('Prompt ricevuto:', prompt ? 'Sì' : 'No');
    console.log('Immagine ricevuta:', imageBase64 ? 'Sì' : 'No');
    
    if (!prompt) {
      console.log('ERRORE: Prompt mancante');
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const stabilityApiKey = Deno.env.get('STABILITY_API_KEY');
    
    if (!stabilityApiKey) {
      console.log('ERRORE: STABILITY_API_KEY non configurato');
      return new Response(
        JSON.stringify({ error: 'STABILITY_API_KEY not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('API Key presente:', stabilityApiKey ? 'Sì' : 'No');

    let response;

    if (imageBase64) {
      console.log('=== MODALITÀ ControlNet IMAGE-TO-IMAGE ===');
      
      try {
        // Rimuovi il prefisso data:image se presente
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        console.log('Base64 data length:', base64Data.length);
        
        // Converti base64 in Uint8Array
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        console.log('Immagine originale dimensione:', bytes.length, 'bytes');

        // Usa il prompt specifico per ControlNet
        const controlNetPrompt = "Insert the oven in the center of the kitchen. Maintain existing wall and lighting. Use ControlNet depth.";
        
        // Crea FormData per ControlNet
        const formData = new FormData();
        formData.append('init_image', new File([bytes], 'image.png', { type: 'image/png' }));
        formData.append('text_prompts[0][text]', controlNetPrompt);
        formData.append('text_prompts[0][weight]', '1');
        formData.append('cfg_scale', '15'); // Aumentato per maggiore aderenza al prompt
        formData.append('image_strength', '0.6'); // Ridotto per preservare meglio l'ambiente
        formData.append('steps', '50'); // Aumentato per migliore qualità
        formData.append('samples', '1');
        formData.append('style_preset', 'photographic'); // Stile fotografico
        
        console.log('FormData ControlNet creato, invio richiesta a Stability AI...');
        console.log('Usando prompt ControlNet:', controlNetPrompt);

        // Utilizza il modello stable-diffusion-v1-6 che supporta meglio ControlNet
        response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-v1-6/image-to-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stabilityApiKey}`,
            'Accept': 'application/json',
          },
          body: formData,
        });

        console.log('Risposta Stability AI ControlNet status:', response.status);
        console.log('Risposta Stability AI headers:', Object.fromEntries(response.headers.entries()));

      } catch (imageProcessingError) {
        console.error('ERRORE nel processing ControlNet dell\'immagine:', imageProcessingError);
        throw new Error(`Errore processing ControlNet immagine: ${imageProcessingError.message}`);
      }
    } else {
      console.log('=== MODALITÀ TEXT-TO-IMAGE ===');
      
      response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stabilityApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1
            }
          ],
          cfg_scale: 15,
          height: 512,
          width: 512,
          steps: 50,
          samples: 1,
          style_preset: 'photographic',
        }),
      });

      console.log('Risposta Stability AI text-to-image status:', response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== ERRORE STABILITY AI ControlNet ===');
      console.error('Status:', response.status);
      console.error('Status text:', response.statusText);
      console.error('Error body:', errorText);
      throw new Error(`Stability AI ControlNet error: ${response.status} ${errorText}`);
    }

    console.log('Risposta ControlNet OK, parsing JSON...');
    const result = await response.json();
    console.log('JSON ControlNet parsato, checking artifacts...');
    
    if (!result.artifacts || result.artifacts.length === 0) {
      console.error('ERRORE: Nessun artifact ControlNet nel risultato');
      console.error('Risultato ControlNet completo:', JSON.stringify(result, null, 2));
      throw new Error('No ControlNet image generated');
    }

    const imageBase64Result = result.artifacts[0].base64;
    const imageUrl = `data:image/png;base64,${imageBase64Result}`;

    console.log('=== SUCCESSO ControlNet ===');
    console.log('Immagine ControlNet generata con successo, lunghezza base64:', imageBase64Result.length);

    return new Response(
      JSON.stringify({ 
        imageURL: imageUrl,
        success: true,
        method: 'controlnet_depth'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('=== ERRORE GENERALE ControlNet ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate ControlNet image', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
