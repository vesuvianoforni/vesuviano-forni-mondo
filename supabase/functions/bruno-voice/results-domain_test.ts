import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { AnalyzedEvent, analyzedMatches, recordingAddress, RecordingCallback, spokenTranscript } from './results-domain.ts';

Deno.test('CRM transcript retains exactly what customer and Bruno said, not private tools', () => {
  assertEquals(spokenTranscript([{role:'assistant',text:'Hello, this call is being recorded.'},{role:'user',text:'We need a gas oven.'},{role:'tool',text:'private catalog lookup'},{role:'assistant',text:null}]),[
    {speaker:'bruno',text:'Hello, this call is being recorded.',at:null},{speaker:'customer',text:'We need a gas oven.',at:null},
  ]);
});
Deno.test('Recording download excludes arbitrary or non-secure hosts', () => {
  assertEquals(recordingAddress('https://us-central-1.telnyxcloudstorage.com/recordings/voice.mp3'),'https://us-central-1.telnyxcloudstorage.com/recordings/voice.mp3');
  assertThrows(()=>recordingAddress('https://telnyx.com.attacker.test/audio'));
  assertEquals(recordingAddress('https://s3.amazonaws.com/telephony-recorder-prod/a/b.mp3'),'https://s3.amazonaws.com/telephony-recorder-prod/a/b.mp3');
  assertThrows(()=>recordingAddress('https://s3.amazonaws.com/other-bucket/b.mp3'));
  assertThrows(()=>recordingAddress('http://telnyx.com/audio'));
  assertThrows(()=>recordingAddress('https://127.0.0.1/audio'));
});
Deno.test('Recorded result belongs only to the approved call and Bruno assistant', () => {
  const event = AnalyzedEvent.parse({data:{event_type:'call.analyzed',id:'00000000-0000-4000-8000-000000000001',payload:{assistant_id:'bruno',call_control_id:'v3:call',conversation_id:'00000000-0000-4000-8000-000000000002'}}});
  assertEquals(analyzedMatches(event,{approved_at:'2026-11-05',provider_call_id:'v3:call'},'bruno'),true);
  assertEquals(analyzedMatches(event,{approved_at:'2026-11-05',provider_call_id:'v3:other'},'bruno'),false);
  assertEquals(analyzedMatches(event,{approved_at:null,provider_call_id:'v3:call'},'bruno'),false);
});
Deno.test('Recording lifecycle is separate from call status', () => {
  assertEquals(RecordingCallback.safeParse({CallSid:'v3:call',CallStatus:'completed'}).success,false);
  assertEquals(RecordingCallback.parse({CallSid:'v3:call',RecordingStatus:'completed',RecordingDuration:'120'}).RecordingDuration,120);
});