import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { inboundCaller, inboundEventStatus, InboundStatus, forwardedEventMatches } from './inbound-history.ts';

Deno.test('UK incoming calls preserve the complete caller and reject another receiving line', () => {
  assertEquals(inboundCaller({ From: '+393383156161', To: '+447457416033' }), '+393383156161');
  assertEquals(inboundCaller({ From: '+393383156161', To: '+447700900123' }), null);
  assertEquals(inboundCaller({ From: 'anonymous', To: '+447457416033' }), 'Numero privato');
});
Deno.test('Only an office answer proves that the forwarded incoming call was answered', () => {
  assertEquals(inboundEventStatus('answered', false), null);
  assertEquals(inboundEventStatus('answered', true), 'answered');
  assertEquals(inboundEventStatus('completed', false), 'unknown');
  assertEquals(inboundEventStatus('completed', true), 'completed');
});
Deno.test('Unanswered and busy forwarded calls stay distinguishable', () => {
  assertEquals(inboundEventStatus('no-answer', true), 'missed');
  assertEquals(inboundEventStatus('busy', true), 'busy');
  assertEquals(inboundEventStatus('failed', true), 'failed');
});
Deno.test('Forwarding events accept only bounded durations and provider call references', () => {
  assertEquals(InboundStatus.safeParse({ CallSid: 'incoming-1', DialCallStatus: 'completed', DialCallDuration: '236' }).success, true);
  assertEquals(InboundStatus.safeParse({ CallSid: 'incoming-1', CallDuration: -1 }).success, false);
  assertEquals(InboundStatus.safeParse({ CallSid: '', CallStatus: 'completed' }).success, false);
});
Deno.test('An office callback binds the parent call and both phone numbers before it can alter history', () => {
  const call = { provider_call_id: 'parent-1', forwarded_to: '+3908119231684', forward_call_id: null };
  const event = { CallSid: 'child-1', ParentCallSid: 'parent-1', From: '+447457416033', To: '+3908119231684' };
  assertEquals(forwardedEventMatches(call, event, false), true);
  assertEquals(forwardedEventMatches(call, { ...event, ParentCallSid: 'another-parent' }, false), false);
  assertEquals(forwardedEventMatches(call, { ...event, To: '+3908119237684' }, false), false);
  assertEquals(forwardedEventMatches(call, { ...event, ParentCallSid: undefined }, false), false);
  assertEquals(forwardedEventMatches({ ...call, forward_call_id: 'child-1' }, { CallSid: 'parent-1', DialCallSid: 'another-child' }, true), false);
});