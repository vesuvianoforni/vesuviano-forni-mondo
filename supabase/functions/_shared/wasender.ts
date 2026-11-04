const GATEWAY_URL = 'https://connector-gateway.lovable.dev/udc_wasender';

/** One submission only: transport failures must never trigger an automatic resend. */
export async function sendGennaroWhatsApp(
  credentials: { lovableKey: string; connectionKey: string },
  input: { phone: string; text: string; mediaUrl?: string },
  request: typeof fetch = fetch,
): Promise<string> {
  if (!credentials.lovableKey || !credentials.connectionKey) throw new Error('WaSender di Gennaro non ancora collegato');
  if (!/^\d{7,15}$/.test(input.phone)) throw new Error('Telefono cliente non valido');
  if (!input.text.trim() || input.text.length > 4000) throw new Error('Messaggio non valido');
  const response = await request(`${GATEWAY_URL}/api/send-message`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${credentials.lovableKey}`,
      'X-Connection-Api-Key': credentials.connectionKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to: `+${input.phone}`, text: input.text, ...mediaField(input.mediaUrl) }),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`WaSender ${response.status}: ${body}`);
  let result;
  try { result = JSON.parse(body); } catch { throw new Error('WaSender: conferma invio non leggibile; verifica la chat prima di riprovare.'); }
  if (result.success === false) throw new Error(`WaSender ${response.status}: ${body}`);
  const id = result.data?.msgId;
  if ((typeof id !== 'string' && typeof id !== 'number') || String(id).trim() === '') {
    throw new Error('WaSender: conferma invio incompleta; verifica la chat prima di riprovare.');
  }
  return String(id);
}

/** WaSender media field chosen from the file extension (image, video, or document). */
export function mediaField(url?: string): Record<string, string> {
  if (!url) return {};
  const path = url.split('?')[0].toLowerCase();
  if (/\.(jpe?g|png|webp|gif)$/.test(path)) return { imageUrl: url };
  if (/\.(mp4|mov|3gp|webm)$/.test(path)) return { videoUrl: url };
  return { documentUrl: url };
}
