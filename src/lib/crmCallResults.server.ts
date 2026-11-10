import type { SupabaseClient } from '@supabase/supabase-js';
import { callAnalysisRecovery } from './crmCallResults';
import { CallAnalysisError, transcribeDirectAudio, summarizeDirectTranscript } from './crmCallAi.server';

export type CallResultsDb = SupabaseClient;
function check(result: { error: { message: string } | null }) { if (result.error) throw new Error(result.error.message); }
export async function processDirectResult(db: CallResultsDb, callId: string, token: string, internalKey?: string) {
  const lease = crypto.randomUUID();
  const claim = await db.rpc('claim_crm_call_result', { p_call: callId, p_token: token, p_lease: lease });
  check(claim); const job = claim.data?.[0]; if (!job) return { skipped: true };
  try {
    let transcript: string | null = job.transcript;
    if (!transcript) {
      const parts = await db.from('crm_call_audio_parts').select('ordinal,storage_path,transcript').eq('call_id', callId).eq('uploaded', true).order('ordinal').limit(240); check(parts);
      const texts: string[] = [];
      let transcribedParts = 0;
      for (const part of parts.data ?? []) {
        let text = part.transcript;
        if (!text) {
          if (transcribedParts >= 12) {
            check(await db.from('crm_call_results').update({ status: 'queued', attempts: Math.max(0, job.attempts - 1), lease_token: null, lease_until: null, next_attempt_at: new Date(Date.now() + 60000).toISOString() }).eq('call_id', callId).eq('lease_token', lease));
            return { ready: false, pending: true };
          }
          const audio = await db.storage.from('bruno-call-recordings').download(part.storage_path); check(audio);
          if (!audio.data || !part.storage_path.startsWith(`direct/${callId}/`)) throw new Error('Registrazione non disponibile.');
          text = await transcribeDirectAudio(new File([audio.data], 'conversation.wav', { type: 'audio/wav' }), internalKey);
          check(await db.from('crm_call_audio_parts').update({ transcript: text }).eq('call_id', callId).eq('ordinal', part.ordinal));
          transcribedParts++;
        }
        texts.push(text);
      }
      if (!texts.length) throw new Error('Registrazione non disponibile.');
      transcript = texts.join('\n\n');
      check(await db.from('crm_call_results').update({ transcript }).eq('call_id', callId).eq('lease_token', lease));
    }
    const summary = job.summary || await summarizeDirectTranscript(transcript, internalKey);
    check(await db.from('crm_call_results').update({ summary }).eq('call_id', callId).eq('lease_token', lease));
    // CRM message is updated before the call, whose trigger wakes the summary-only Telegram card.
    check(await db.from('crm_messages').update({ body: summary }).eq('id', callId).eq('sender', 'operator'));
    check(await db.from('crm_direct_calls').update({ summary, recording_status: 'ready', recording_error: null }).eq('id', callId));
    check(await db.from('crm_call_results').update({ status: 'ready', error: null, lease_token: null, lease_until: null }).eq('call_id', callId).eq('lease_token', lease));
    return { ready: true };
  } catch (error) {
    const failure = error instanceof CallAnalysisError ? error : new CallAnalysisError('Elaborazione interrotta; verifica il risultato prima di riprovare.', 400);
    const recovery = callAnalysisRecovery(failure.status, failure.message, failure.type);
    const paused = recovery === 'paused' || recovery === 'provider_denied';
    if (paused) check(await db.from('crm_call_ai_state').update({ paused: true, reason: failure.message, provider_denied: recovery === 'provider_denied' }).eq('key', 'calls'));
    const retry = recovery === 'retry' && job.attempts < 4;
    check(await db.from('crm_call_results').update({ status: paused ? 'paused' : retry ? 'queued' : 'failed', error: failure.message,
      lease_token: null, lease_until: null, next_attempt_at: new Date(Date.now() + 60000 * 2 ** job.attempts).toISOString() }).eq('call_id', callId).eq('lease_token', lease));
    if (!retry) check(await db.from('crm_direct_calls').update({ recording_status: paused ? 'paused' : 'failed', recording_error: failure.message }).eq('id', callId));
    return { ready: false, status: failure.status, error: failure.message };
  } finally {
    check(await db.from('crm_call_ai_state').update({ lease_token: null, lease_until: null }).eq('key', 'calls').eq('lease_token', lease));
  }
}
export async function processDueDirectResults(db: CallResultsDb, internalKey?: string) {
  const state = await db.from('crm_call_ai_state').select('paused').eq('key', 'calls').single(); check(state);
  if (state.data?.paused) return;
  const now = new Date().toISOString();
  const due = await db.from('crm_call_results').select('call_id,worker_token').in('status', ['queued', 'running']).lte('next_attempt_at', now).or(`lease_until.is.null,lease_until.lt.${now}`).order('created_at').limit(1); check(due);
  for (const job of due.data ?? []) await processDirectResult(db, job.call_id, job.worker_token, internalKey);
}