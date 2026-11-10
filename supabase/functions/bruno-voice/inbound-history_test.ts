import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { inboundCaller, inboundEventStatus, InboundStatus } from './inbound-history.ts';

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