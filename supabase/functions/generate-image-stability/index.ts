
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
    
    console.log('=== INIZIO RICHIESTA STABILITY AI ===');
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
    console.log('API Key prefix:', stabilityApiKey.substring(0, 8) + '...');

    // Test della validità della chiave API
    console.log('=== VERIFICA VALIDITÀ API KEY ===');
    const testResponse = await fetch('https://api.stability.ai/v1/user/account', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stabilityApiKey}`,
        'Accept': 'application/json',
      },
    });

    console.log('Test API Key status:', testResponse.status);
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('API Key non valida:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid API Key', 
          details: errorText,
          suggestion: 'Verifica che la chiave API sia corretta e che abbia crediti disponibili'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const accountInfo = await testResponse.json();
    console.log('Account info:', JSON.stringify(accountInfo, null, 2));

    let response;

    if (imageBase64) {
      console.log('=== MODALITÀ IMAGE-TO-IMAGE ===');
      
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

        // Crea FormData per image-to-image
        const formData = new FormData();
        formData.append('init_image', new File([bytes], 'image.png', { type: 'image/png' }));
        formData.append('text_prompts[0][text]', prompt);
        formData.append('text_prompts[0][weight]', '1');
        formData.append('cfg_scale', '7');
        formData.append('image_strength', '0.35');
        formData.append('steps', '30');
        formData.append('samples', '1');
        
        console.log('FormData creato, invio richiesta a Stability AI...');

        response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-v1-6/image-to-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stabilityApiKey}`,
            'Accept': 'application/json',
          },
          body: formData,
        });

        console.log('Risposta Stability AI image-to-image status:', response.status);

      } catch (imageProcessingError) {
        console.error('ERRORE nel processing dell\'immagine:', imageProcessingError);
        throw new Error(`Errore processing immagine: ${imageProcessingError.message}`);
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
          cfg_scale: 7,
          height: 512,
          width: 512,
          steps: 30,
          samples: 1,
        }),
      });

      console.log('Risposta Stability AI text-to-image status:', response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== ERRORE STABILITY AI ===');
      console.error('Status:', response.status);
      console.error('Status text:', response.statusText);
      console.error('Error body:', errorText);
      
      // Gestione errori specifici
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Crediti insufficienti', 
            details: 'Il tuo account Stability AI non ha crediti sufficienti',
            suggestion: 'Aggiungi crediti al tuo account Stability AI'
          }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(`Stability AI error: ${response.status} ${errorText}`);
    }

    console.log('Risposta OK, parsing JSON...');
    const result = await response.json();
    console.log('JSON parsato, checking artifacts...');
    
    if (!result.artifacts || result.artifacts.length === 0) {
      console.error('ERRORE: Nessun artifact nel risultato');
      console.error('Risultato completo:', JSON.stringify(result, null, 2));
      throw new Error('No image generated');
    }

    const imageBase64Result = result.artifacts[0].base64;
    const imageUrl = `data:image/png;base64,${imageBase64Result}`;

    console.log('=== SUCCESSO ===');
    console.log('Immagine generata con successo, lunghezza base64:', imageBase64Result.length);

    return new Response(
      JSON.stringify({ 
        imageURL: imageUrl,
        success: true,
        accountInfo: accountInfo
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('=== ERRORE GENERALE ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate image', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
