import { z } from 'npm:zod@3';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { e164, FROM_NUMBER } from './domain.ts';

const statuses = ['initiated', 'ringing', 'answered', 'in-progress', 'completed', 'no-answer', 'busy', 'canceled', 'failed'] as const;
export const InboundStatus = z.object({
  CallSid: z.string().min(1).max(500), CallStatus: z.enum(statuses).optional(),
  From: z.string().max(80).optional(), To: z.string().max(80).optional(),
  ParentCallSid: z.string().max(500).optional(),
  CallDuration: z.coerce.number().int().min(0).max(86400).optional(),
  DialCallSid: z.string().max(500).optional(), DialCallStatus: z.enum(statuses).optional(),
  DialCallDuration: z.coerce.number().int().min(0).max(86400).optional(),
}).passthrough();

export function inboundCaller(data: Record<string, unknown>): string | null {
  if (data.To !== FROM_NUMBER || typeof data.From !== 'string') return null;
  try { return e164(data.From); } catch {
    return ['anonymous', 'restricted', 'unavailable', 'unknown'].includes(data.From.toLowerCase()) ? 'Numero privato' : null;
  }
}
export function inboundEventStatus(status: string, forwarded: boolean): string | null {
  if (status === 'initiated') return 'received';
  if (status === 'ringing') return 'ringing';
  // The incoming leg can be answered before the office picks up: only the forwarded leg proves an answer.
  if (status === 'answered' || status === 'in-progress') return forwarded ? 'answered' : null;
  if (status === 'completed') return forwarded ? 'completed' : 'unknown';
  if (status === 'no-answer' || status === 'canceled') return 'missed';
  if (status === 'busy') return 'busy';
  if (status === 'failed') return 'failed';
  return null;
}
function check(result: { error: { message: string } | null }) { if (result.error) throw new Error('Inbound history persistence failed'); }

// Called only after Telnyx signature verification. Never creates a lead or starts an AI result job.
export async function receiveForwardedCall(db: SupabaseClient, data: Record<string, unknown>, target: string) {
  const parsed = InboundStatus.safeParse(data);
  if (!parsed.success) return null;
  const caller = inboundCaller(data);
  if (!caller || typeof data.CallSid !== 'string' || !data.CallSid || data.CallSid.length > 500) return null;
  check(await db.from('crm_inbound_calls').upsert({
    provider_call_id: data.CallSid, caller_number: caller, received_number: FROM_NUMBER, forwarded_to: e164(target),
  }, { onConflict: 'provider_call_id', ignoreDuplicates: true }));
  const row = await db.from('crm_inbound_calls').select('id').eq('provider_call_id', data.CallSid).single(); check(row);
  return row.data?.id ?? null;
}

export function forwardedEventMatches(call: { provider_call_id: string; forwarded_to: string; forward_call_id: string | null }, data: z.infer<typeof InboundStatus>, action: boolean) {
  if (action) return data.CallSid === call.provider_call_id && Boolean(data.DialCallSid) && (!call.forward_call_id || data.DialCallSid === call.forward_call_id);
  return data.To === call.forwarded_to && data.From === FROM_NUMBER &&
    data.ParentCallSid === call.provider_call_id && (!call.forward_call_id || data.CallSid === call.forward_call_id);
}

export async function updateForwardedCall(db: SupabaseClient, raw: unknown, id?: string, action = false) {
  const parsed = InboundStatus.safeParse(raw);
  if (!parsed.success) return { ignored: true };
  const data = parsed.data;
  let query = db.from('crm_inbound_calls').select('id,provider_call_id,forwarded_to,forward_call_id');
  query = id ? query.eq('id', id) : query.eq('provider_call_id', data.CallSid);
  const result = await query.maybeSingle(); check(result);
  const call = result.data; if (!call) return { ignored: true };
  const forwarded = Boolean(id);
  if (forwarded && !forwardedEventMatches(call, data, action)) return { ignored: true };
  const providerStatus = action ? data.DialCallStatus : data.CallStatus;
  const status = providerStatus ? inboundEventStatus(providerStatus, forwarded) : null;
  if (!status) return { ignored: true };
  check(await db.rpc('apply_crm_inbound_event', {
    p_id: call.id, p_status: status,
    p_forward_status: forwarded ? providerStatus : null,
    p_forward_call_id: forwarded ? (action ? data.DialCallSid ?? null : data.CallSid) : null,
    p_duration: forwarded ? (action ? data.DialCallDuration ?? null : data.CallDuration ?? null) : null,
  }));
  return { ok: true };
}