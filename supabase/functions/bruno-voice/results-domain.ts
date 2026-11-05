import { z } from 'npm:zod@3';

export const RecordingCallback = z.object({ CallSid: z.string().min(1).max(500), RecordingStatus: z.enum(['in-progress','completed','absent']), RecordingUrl: z.string().url().optional(), RecordingDuration: z.coerce.number().int().min(0).max(14400).optional() }).passthrough();
export const AnalyzedEvent = z.object({ data: z.object({ event_type: z.literal('call.analyzed'), id: z.string().uuid(), payload: z.object({ assistant_id: z.string().max(150), call_control_id: z.string().max(500), conversation_id: z.string().uuid(), duration_sec: z.number().int().min(0).max(14400).optional(), recordings: z.array(z.object({ download_urls: z.object({ mp3: z.string().url().optional(), wav: z.string().url().optional() }) })).max(10).nullish() }) }) });
export function recordingAddress(value: string) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || !['telnyxcloudstorage.com','telnyx.com'].some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) throw new Error('invalid_recording_host');
  return url.href;
}
export const TranscriptMessages = z.array(z.object({ role: z.string(), text: z.string().max(20000).nullable(), sent_at: z.string().nullable().optional(), created_at: z.string().optional() }).passthrough()).max(2000);
export function spokenTranscript(value: unknown) {
  return TranscriptMessages.parse(value).filter(m => ['user','assistant'].includes(m.role) && m.text?.trim()).map(m => ({ speaker: m.role === 'user' ? 'customer' : 'bruno', text: m.text ?? '', at: m.sent_at ?? m.created_at ?? null }));
}
export function analyzedMatches(event: z.infer<typeof AnalyzedEvent>, call: { approved_at: string | null; provider_call_id: string | null }, assistant: string) {
  return Boolean(call.approved_at && call.provider_call_id && event.data.payload.call_control_id === call.provider_call_id && event.data.payload.assistant_id === assistant);
}