import { z } from 'zod';
import { CRM_CALLER_NUMBER } from './crmDialer';

const text = z.string().max(500).nullish();
export const TelnyxHistoryRecord = z.object({
  id: z.string().min(1).max(500), direction: z.string(), record_type: z.string(),
  caller_number: text, dest_number: text, cli: text, cld: text, cf_number: text,
  telnyx_session_id: text, call_control_id: text, hangup_cause: text,
  started_at: z.string().datetime({ offset: true }), finished_at: text, answered_at: text,
  call_sec: z.coerce.number().int().min(0).max(86400),
}).passthrough();
export type TelnyxHistoryRow = z.infer<typeof TelnyxHistoryRecord>;
const international = (v: string | null | undefined) => v && /^\+[1-9]\d{7,14}$/.test(v) ? v : null;
const timestamp = (v: string | null | undefined) => v && Number.isFinite(Date.parse(v)) ? v : null;
const identity = (row: TelnyxHistoryRow) => row.telnyx_session_id || row.call_control_id || row.id;
function strongest(rows: TelnyxHistoryRow[]) {
  return [...rows].sort((a, b) => Number(Boolean(b.answered_at)) - Number(Boolean(a.answered_at)) || b.call_sec - a.call_sec)[0];
}
function failedStatus(cause: string | null | undefined): 'busy' | 'missed' | 'failed' {
  if (cause === 'USER_BUSY') return 'busy';
  if (['NO_ANSWER', 'NO_USER_RESPONSE', 'ORIGINATOR_CANCEL', 'SUBSCRIBER_ABSENT', 'CALL_REJECTED', 'NORMAL_CLEARING'].includes(cause ?? '')) return 'missed';
  return 'failed';
}

// Both CDR legs must share the exact Telnyx session. Never infer an office answer from the incoming leg.
export function historicalInboundCalls(rows: TelnyxHistoryRow[], knownAiProviderIds: readonly string[]) {
  const ai = new Set(knownAiProviderIds);
  const groups = new Map<string, TelnyxHistoryRow[]>();
  for (const row of rows) {
    if (row.record_type !== 'sip-trunking' || row.direction !== 'inbound' || (international(row.cld) ?? international(row.dest_number)) !== CRM_CALLER_NUMBER) continue;
    const key = identity(row); groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  const calls = [];
  for (const incoming of groups.values()) {
    if (incoming.some(row => row.call_control_id && ai.has(row.call_control_id))) continue;
    const parent = strongest(incoming); if (!parent) continue;
    const caller = international(parent.cli) ?? international(parent.caller_number) ?? 'Numero privato';
    const sid = parent.telnyx_session_id;
    const leg = sid ? strongest(rows.filter(row => row.telnyx_session_id === sid && row.direction === 'outbound' &&
      (row.caller_number || row.cli) === CRM_CALLER_NUMBER && international(row.dest_number || row.cld) !== CRM_CALLER_NUMBER && international(row.dest_number || row.cld))) : undefined;
    const legacyTarget = international(parent.cf_number);
    const legacyLeg = legacyTarget && sid ? strongest(rows.filter(row => row.telnyx_session_id === sid && row.direction === 'outbound' && row.cf_number === legacyTarget &&
      (row.caller_number || row.cli) === (parent.caller_number || parent.cli))) : undefined;
    const forwardLeg = leg ?? legacyLeg;
    const target = leg ? international(leg.dest_number || leg.cld) : legacyTarget;
    const endedAt = timestamp(parent.finished_at); if (!endedAt) continue;
    const answeredAt = timestamp(forwardLeg?.answered_at);
    const status = target ? (forwardLeg ? (answeredAt ? 'completed' : failedStatus(forwardLeg.hangup_cause)) : 'unknown') :
      (parent.answered_at ? 'unknown' : failedStatus(parent.hangup_cause));
    calls.push({
      provider_call_id: parent.call_control_id || `telnyx-session:${identity(parent)}`,
      forward_call_id: forwardLeg?.call_control_id || null, caller_number: caller,
      received_number: CRM_CALLER_NUMBER, forwarded_to: target, status,
      forward_status: target && forwardLeg ? (answeredAt ? 'completed' : status === 'missed' ? 'no-answer' : status) : null,
      answered_at: target ? answeredAt : null, ended_at: endedAt,
      duration_seconds: target ? (forwardLeg ? forwardLeg.call_sec : null) : parent.call_sec,
      created_at: parent.started_at, source: 'telnyx_cdr',
    });
  }
  return calls.sort((a,b) => b.created_at.localeCompare(a.created_at));
}