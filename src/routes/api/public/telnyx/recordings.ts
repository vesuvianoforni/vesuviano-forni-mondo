import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { directEventMatches, verifyDirectCallSignature } from '@/lib/crmCallResults';

const eventSchema = z.object({ data: z.object({ id: z.string(), event_type: z.string(), payload: z.record(z.string(), z.unknown()) }) });
export const Route = createFileRoute('/api/public/telnyx/recordings')({
  server: { handlers: { POST: async ({ request }) => {
    if (Number(request.headers.get('content-length')) > 256 * 1024) return new Response('Payload too large', { status: 413 });
    const reader = request.body?.getReader(); if (!reader) return new Response('Missing body', { status: 400 });
    let raw = '', bytes = 0; const decoder = new TextDecoder();
    while (true) { const part = await reader.read(); if (part.done) break; bytes += part.value.byteLength;
      if (bytes > 256 * 1024) { await reader.cancel(); return new Response('Payload too large', { status: 413 }); } raw += decoder.decode(part.value, { stream: true }); }
    raw += decoder.decode();
    if (!await verifyDirectCallSignature(raw, request.headers.get('telnyx-signature-ed25519'), request.headers.get('telnyx-timestamp'))) return new Response('Invalid signature', { status: 401 });
    const parsed = eventSchema.safeParse(JSON.parse(raw)); if (!parsed.success) return new Response('Invalid event', { status: 400 });
    const { event_type: type, payload: p } = parsed.data.data;
    if (!['call.initiated','call.answered','call.hangup','call.recording.saved','call.recording.error'].includes(type)) return new Response('ignored');
    const { supabaseAdmin: admin } = await import('@/integrations/supabase/client.server');
    const { startVerifiedRecording, captureDirectRecording, processDueDirectResults } = await import('@/lib/crmCallResults.server');
    const db = admin as unknown as import('@supabase/supabase-js').SupabaseClient;
    let callId: string | undefined;
    if (typeof p.client_state === 'string') { try { callId = z.string().uuid().parse(JSON.parse(atob(p.client_state)).crm_call_id); } catch { /* Other Telnyx flows have different state. */ } }
    if (!callId && Array.isArray(p.custom_headers)) {
      const header = p.custom_headers.find(h => h?.name?.toLowerCase() === 'x-crm-call-id');
      const id = z.string().uuid().safeParse(header?.value); if (id.success) callId = id.data;
    }
    let query = db.from('crm_direct_calls').select('*');
    if (callId) query = query.eq('id', callId);
    else if (typeof p.call_control_id === 'string') query = query.eq('telnyx_control_id', p.call_control_id);
    else return new Response('unbound');
    const found = await query.maybeSingle(); if (found.error) return new Response('Lookup failed', { status: 500 });
    const call = found.data; if (!call) return new Response('unbound');
    if (type === 'call.initiated' || type === 'call.answered') {
      if (!directEventMatches(p, call) || typeof p.call_control_id !== 'string') return new Response('Binding rejected', { status: 403 });
      if (call.telnyx_control_id && call.telnyx_control_id !== p.call_control_id) return new Response('Call leg rejected', { status: 403 });
      const update = await db.from('crm_direct_calls').update({ telnyx_control_id: p.call_control_id, telnyx_session_id: p.call_session_id,
        provider_verified_at: new Date().toISOString() }).eq('id', call.id);
      if (update.error) return new Response('Binding failed', { status: 500 });
      if (type === 'call.answered') {
        try { await startVerifiedRecording(db, { ...call, telnyx_control_id: p.call_control_id, provider_verified_at: new Date().toISOString() }); }
        catch { return new Response('Recording failed', { status: 502 }); }
      }
      return new Response('ok');
    }
    if (!call.provider_verified_at || call.telnyx_control_id !== p.call_control_id || call.telnyx_session_id !== p.call_session_id) return new Response('Binding rejected', { status: 403 });
    if (type === 'call.recording.saved') {
      if (typeof p.recording_id !== 'string') return new Response('Missing recording', { status: 400 });
      const urls = p.recording_urls as { mp3?: string } | undefined;
      if (!urls?.mp3) return new Response('Missing audio', { status: 400 });
      const existing = await db.from('crm_call_results').select('call_id').eq('call_id', call.id).maybeSingle();
      if (!existing.data) await captureDirectRecording(db, call.id, p.recording_id, urls.mp3);
      // One result at a time; durable claims/checkpoints protect repeated provider deliveries.
      await processDueDirectResults(db);
    } else if (type === 'call.recording.error') {
      await db.from('crm_direct_calls').update({ recording_status: 'failed', recording_error: 'Telnyx non ha potuto salvare la registrazione.' }).eq('id', call.id);
    } else if (type === 'call.hangup' && ['pending','starting'].includes(call.recording_status)) {
      await db.from('crm_direct_calls').update({ recording_status: 'unavailable', recording_error: 'Nessuna registrazione disponibile per questa chiamata.' }).eq('id', call.id);
    }
    return new Response('ok');
  } } },
});