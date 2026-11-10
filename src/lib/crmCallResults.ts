import { CRM_DIALER_CONNECTION, CRM_CALLER_NUMBER } from './crmDialer';

export const TELNYX_RECORDING_PUBLIC_KEY = 'y/2GXKZ0tRlmJyb6W417Iugve+RNsYRFhrNzBkqvPNY=';
export const CALL_AUDIO_MAX_BYTES = 24 * 1024 * 1024;
export function directRecordingCommand(id: string) {
  return { format: 'mp3', channels: 'dual', recording_track: 'both', play_beep: true,
    command_id: id, custom_file_name: id, client_state: btoa(JSON.stringify({ crm_call_id: id })), transcription: false };
}
export function directEventMatches(payload: Record<string, unknown>, call: { destination: string; from_number: string }) {
  return String(payload['connection_id']) === CRM_DIALER_CONNECTION && payload['to'] === call.destination && call.from_number === CRM_CALLER_NUMBER;
}
export function callRecordingUrl(value: string) {
  const url = new URL(value);
  const allowed = ['telnyx.com', 'telnyxcloudstorage.com'].some(host => url.hostname === host || url.hostname.endsWith(`.${host}`)) ||
    (url.hostname === 's3.amazonaws.com' && url.pathname.startsWith('/telephony-recorder-prod/'));
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || !allowed) throw new Error('Indirizzo registrazione non valido.');
  return url.href;
}
export async function verifyDirectCallSignature(raw: string, signature: string | null, timestamp: string | null, now = Date.now()) {
  if (!signature || !timestamp || !/^\d+$/.test(timestamp) || Math.abs(now / 1000 - Number(timestamp)) > 300) return false;
  try {
    const decode = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', decode(TELNYX_RECORDING_PUBLIC_KEY), 'Ed25519', false, ['verify']);
    return await crypto.subtle.verify('Ed25519', key, decode(signature), new TextEncoder().encode(`${timestamp}|${raw}`));
  } catch { return false; }
}
export function callAnalysisRecovery(status: number, message: string, type = '') {
  if (status === 429 || status >= 500) return 'retry' as const;
  if (status === 402 || status === 403) return /provider.*deni|access.*deni|account.*suspend/i.test(`${type} ${message}`) ? 'provider_denied' as const : 'paused' as const;
  return 'terminal' as const;
}