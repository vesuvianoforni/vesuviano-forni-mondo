import type { SupabaseClient } from '@supabase/supabase-js';
import { CALL_AUDIO_MAX_BYTES, callAnalysisRecovery, callRecordingUrl, directRecordingCommand } from './crmCallResults';
import { dialerCredentials } from './crmDialer';
import { telnyxDialer } from './crmDialer.server';
import { CallAnalysisError, transcribeDirectAudio, summarizeDirectTranscript } from './crmCallAi.server';

export type CallResultsDb = SupabaseClient;
export function recordingCredentials() {
  const credentials = dialerCredentials({ telnyx: process.env['TELNYX_API_KEY'], lovable: process.env['LOVABLE_API_KEY'], connection: process.env['UDC_TELNYX_API_KEY'] });
  if (!credentials) throw new Error('Telnyx non configurato.');
  return credentials;
}
function check(result: { error: { message: string } | null }) { if (result.error) throw new Error(result.error.message); }
export async function startVerifiedRecording(db: CallResultsDb, call: { id: string; telnyx_control_id: string; provider_verified_at: string | null }) {
  if (!call.provider_verified_at) throw new Error('Chiamata non verificata da Telnyx.');
  const claimed = await db.from('crm_direct_calls').update({ recording_status: 'starting' }).eq('id', call.id).eq('recording_status', 'pending').select('id').maybeSingle();
  check(claimed); if (!claimed.data) return;
  try {
    await telnyxDialer(`/calls/${encodeURIComponent(call.telnyx_control_id)}/actions/record_start`, recordingCredentials(), 'POST', directRecordingCommand(call.id));
    check(await db.from('crm_direct_calls').update({ recording_status: 'recording' }).eq('id', call.id).eq('recording_status', 'starting'));
  } catch (e) {
    check(await db.from('crm_direct_calls').update({ recording_status: 'failed', recording_error: e instanceof Error ? e.message.slice(0, 600) : 'Registrazione non avviata.' }).eq('id', call.id).eq('recording_status', 'starting'));
    throw e;
  }
}
async function boundedAudio(response: Response) {
  if (!response.ok || !response.body) throw new Error(`Registrazione non disponibile (${response.status}).`);
  if (Number(response.headers.get('content-length')) > CALL_AUDIO_MAX_BYTES) throw new CallAnalysisError('Registrazione oltre il limite elaborabile.', 400);
  const chunks: Uint8Array[] = []; let total = 0; const reader = response.body.getReader();
  while (true) { const part = await reader.read(); if (part.done) break; total += part.value.byteLength;
    if (total > CALL_AUDIO_MAX_BYTES) { await reader.cancel(); throw new CallAnalysisError('Registrazione oltre il limite elaborabile.', 400); } chunks.push(part.value); }
  if (!total) throw new CallAnalysisError('Registrazione vuota.', 400);
  const bytes = new Uint8Array(total); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}
export async function captureDirectRecording(db: CallResultsDb, callId: string, recordingId: string, address: string) {
  const response = await fetch(callRecordingUrl(address), { redirect: 'error' });
  const bytes = await boundedAudio(response);
  const path = `direct/${callId}/conversation.mp3`;
  check(await db.storage.from('bruno-call-recordings').upload(path, bytes, { contentType: 'audio/mpeg', upsert: true }));
  check(await db.from('crm_call_results').upsert({ call_id: callId, recording_id: recordingId, recording_path: path }, { onConflict: 'call_id', ignoreDuplicates: true }));
  check(await db.from('crm_direct_calls').update({ recording_status: 'processing' }).eq('id', callId));
}
export async function processDirectResult(db: CallResultsDb, callId: string, token: string) {
  const lease = crypto.randomUUID();
  const claim = await db.rpc('claim_crm_call_result', { p_call: callId, p_token: token, p_lease: lease });
  check(claim); const job = claim.data?.[0]; if (!job) return { skipped: true };
  try {
    let transcript: string | null = job.transcript;
    if (!transcript) {
      const audio = await db.storage.from('bruno-call-recordings').download(job.recording_path); check(audio);
      if (!audio.data) throw new Error('Registrazione non disponibile.');
      transcript = await transcribeDirectAudio(new File([audio.data], 'conversation.mp3', { type: 'audio/mpeg' }));
      check(await db.from('crm_call_results').update({ transcript }).eq('call_id', callId).eq('lease_token', lease));
    }
    const summary = job.summary || await summarizeDirectTranscript(transcript);
    check(await db.from('crm_call_results').update({ summary, status: 'ready', error: null, lease_token: null, lease_until: null }).eq('call_id', callId).eq('lease_token', lease));
    // CRM message is updated before the call, whose trigger wakes the summary-only Telegram card.
    check(await db.from('crm_messages').update({ body: summary }).eq('id', callId).eq('sender', 'operator'));
    check(await db.from('crm_direct_calls').update({ summary, recording_status: 'ready', recording_error: null }).eq('id', callId));
    return { ready: true };
  } catch (error) {
    const failure = error instanceof CallAnalysisError ? error : new CallAnalysisError('Elaborazione interrotta; verifica il risultato prima di riprovare.', 400);
    const recovery = callAnalysisRecovery(failure.status, failure.message, failure.type);
    const paused = recovery === 'paused' || recovery === 'provider_denied';
    if (paused) check(await db.from('crm_call_ai_state').update({ paused: true, reason: failure.message, provider_denied: recovery === 'provider_denied' }).eq('key', 'calls'));
    const retry = recovery === 'retry' && job.attempts < 4;
    check(await db.from('crm_call_results').update({ status: paused ? 'paused' : retry ? 'queued' : 'failed', error: failure.message,
      lease_token: null, lease_until: null, next_attempt_at: new Date(Date.now() + 60000 * 2 ** job.attempts).toISOString() }).eq('call_id', callId).eq('lease_token', lease));
    if (!retry && !paused) check(await db.from('crm_direct_calls').update({ recording_status: 'failed', recording_error: failure.message }).eq('id', callId));
    return { ready: false, status: failure.status, error: failure.message };
  } finally {
    check(await db.from('crm_call_ai_state').update({ lease_token: null, lease_until: null }).eq('key', 'calls').eq('lease_token', lease));
  }
}
export async function processDueDirectResults(db: CallResultsDb) {
  const state = await db.from('crm_call_ai_state').select('paused').eq('key', 'calls').single(); check(state);
  if (state.data?.paused) return;
  const due = await db.from('crm_call_results').select('call_id,worker_token').in('status', ['queued', 'running']).lte('next_attempt_at', new Date().toISOString()).order('created_at').limit(1); check(due);
  for (const job of due.data ?? []) await processDirectResult(db, job.call_id, job.worker_token);
}