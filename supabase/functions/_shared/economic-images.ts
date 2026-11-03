import { ECONOMIC_IMAGE_MODEL } from './ai-models.ts';

type InlineImage = { inlineData: { mimeType: string; data: string } };

export function inlineImage(dataUrl: string): InlineImage {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
  if (match) return { inlineData: { mimeType: match[1], data: match[2] } };
  if (/^[A-Za-z0-9+/=\s]+$/.test(dataUrl)) return { inlineData: { mimeType: 'image/png', data: dataUrl } };
  throw Object.assign(new Error('Formato immagine non valido.'), { status: 400 });
}

export function economicImageBody(prompt: string, images: InlineImage[]) {
  return {
    model: ECONOMIC_IMAGE_MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }, ...images] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  };
}

async function referenceImage(source: string): Promise<InlineImage> {
  if (!source.startsWith('https://')) return inlineImage(source);
  const allowed = new Set(['vesuvianoforni.com', 'www.vesuvianoforni.com', 'vesuviano-forni-mondo.lovable.app']);
  const supabase = Deno.env.get('SUPABASE_URL');
  if (supabase) allowed.add(new URL(supabase).hostname);
  let url = new URL(source);
  for (let hop = 0; hop < 4; hop++) {
    if (url.protocol !== 'https:' || url.username || url.password || !allowed.has(url.hostname)) {
      throw Object.assign(new Error('Usa una foto del catalogo Vesuviano o una foto caricata.'), { status: 400 });
    }
    const response = await fetch(url, { redirect: 'manual' });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('Location');
      await response.body?.cancel();
      if (!location) break;
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) throw new Error('Foto di riferimento non disponibile.');
    const mimeType = response.headers.get('Content-Type')?.split(';')[0] ?? '';
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(mimeType)) throw new Error('Formato foto non supportato.');
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
    return { inlineData: { mimeType, data: btoa(binary) } };
  }
  throw new Error('Foto di riferimento non disponibile.');
}

// Existing image callers expect final JSON, not an SSE UI: retain that contract.
// All legacy function names now share one economical generation/editing model.
export async function generateEconomicImage(prompt: string, references: string[] = []): Promise<string> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw Object.assign(new Error('Generazione immagini non configurata.'), { status: 503 });
  const images = await Promise.all(references.map(referenceImage));
  const response = await fetch('https://ai.gateway.lovable.dev/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Lovable-AIG-SDK': 'fetch' },
    body: JSON.stringify(economicImageBody(prompt, images)),
  });
  const payload = await response.json();
  if (!response.ok) throw Object.assign(new Error(payload.message ?? payload.error?.message ?? 'Generazione immagine non completata.'), { status: response.status });
  const image = payload.data?.[0]?.b64_json;
  if (!image) throw Object.assign(new Error('Nessuna immagine restituita.'), { status: 422 });
  return `data:image/png;base64,${image}`;
}