import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function dataUrlToUint8Array(dataUrl: string): { bytes: Uint8Array; mime: string } {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return { bytes, mime };
}

async function uploadSpaceImageToStorage(spaceImage: string) {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { bytes, mime } = dataUrlToUint8Array(spaceImage);
  const ext = mime.includes('png') ? 'png' : 'jpg';
  const filename = `inputs/${crypto.randomUUID()}.${ext}`;

  // Ensure bucket exists (ignore error if already exists)
  await supabase.storage.createBucket('oven-gallery', { public: true }).catch(() => {});

  const { error: uploadError } = await supabase.storage
    .from('oven-gallery')
    .upload(filename, bytes, { contentType: mime, upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('oven-gallery').getPublicUrl(filename);
  return data.publicUrl;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { spaceImage, ovenType, ovenModel } = await req.json()

    if (!spaceImage || !ovenType || !ovenModel) {
      return new Response(
        JSON.stringify({ success: false, error: 'Parametri mancanti: spaceImage, ovenType e ovenModel sono richiesti' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('NANOBANANA_API_KEY')
    // Correct API base per official docs
    const generateUrl = Deno.env.get('NANOBANANA_API_BASE_URL') || 'https://api.nanobananaapi.ai/api/v1/nanobanana/generate'
    const recordUrl = 'https://api.nanobananaapi.ai/api/v1/nanobanana/record-info'

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key di Nanobanana non configurata' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1) Upload user space photo so it's externally accessible
    const imageUrl = await uploadSpaceImageToStorage(spaceImage)

    // 2) Build prompt
    const prompt = `Place a ${ovenModel} Vesuviano wood-fired pizza oven realistically in this scene. Match camera perspective, lighting and shadows. Do not alter other objects. Photorealistic, natural integration.`
    console.log('Generating image with prompt:', prompt)

    // 3) Create generation task (image-to-image). API expects URLs and type IMAGETOIAMGE
    const startResp = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        numImages: 1,
        type: 'IMAGETOIAMGE',
        imageUrls: [imageUrl],
        // Optional callback we host to avoid 400 if enforced
        callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-oven-space-callback`
      }),
    })

    const startText = await startResp.text();
    let taskId = '';
    try {
      const parsed = JSON.parse(startText);
      if (parsed?.code === 200 && parsed?.data?.taskId) taskId = parsed.data.taskId;
    } catch (_) {
      // Non-JSON response
    }

    if (!startResp.ok || !taskId) {
      console.error('Nanobanana start error:', startResp.status, startText)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Impossibile creare il task di generazione',
          details: startText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4) Poll task status up to ~45s
    const start = Date.now();
    const timeoutMs = 45000;
    let resultImageUrl = '';
    let lastStatus = '';

    while (Date.now() - start < timeoutMs) {
      const queryUrl = `${recordUrl}?taskId=${encodeURIComponent(taskId)}`
      const statusResp = await fetch(queryUrl, { headers: { 'Authorization': `Bearer ${apiKey}` } })
      const statusText = await statusResp.text();
      try {
        const parsed = JSON.parse(statusText);
        lastStatus = JSON.stringify(parsed?.data ?? parsed);
        if (parsed?.code === 200 && parsed?.data?.successFlag === 1 && parsed?.data?.response?.resultImageUrl) {
          resultImageUrl = parsed.data.response.resultImageUrl;
          break;
        }
      } catch (_) {}
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (!resultImageUrl) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'La generazione richiede più tempo del previsto. Riprova tra qualche secondo.',
          details: lastStatus || 'pending'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, imageUrl: resultImageUrl, prompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-oven-space function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Errore interno del server', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
