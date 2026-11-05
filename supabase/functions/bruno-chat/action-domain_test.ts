import {assertEquals} from 'https://deno.land/std@0.224.0/assert/mod.ts';
import {actionOutcome} from './action-domain.ts';
Deno.test('Dialing is ongoing, never a completed call',()=>assertEquals(actionOutcome('approve_call',{status:'dialing'}),'running'));
Deno.test('Uncertain calls remain uncertain',()=>assertEquals(actionOutcome('approve_call',{status:'unknown'}),'unknown'));
Deno.test('Messages require actual provider evidence, not invented sent true',()=>{
 assertEquals(actionOutcome('send_message',{sent:true,result:'ok'}),'unknown');
 assertEquals(actionOutcome('send_message',{message:{status:'failed'}}),'failed');
 assertEquals(actionOutcome('send_message',{message:{status:'sent',id:'real'}}),'completed');
});
Deno.test('Queued email is not a completed operation',()=>assertEquals(actionOutcome('send_message',{result:'queued'}),'running'));
Deno.test('Creating a proposal is not placing a telephone call',()=>assertEquals(actionOutcome('propose_call',{proposal:{id:'saved'}}),'completed'));
Deno.test('Saved ERP update is a verified completed action',()=>assertEquals(actionOutcome('update_lead',{updated:true}),'completed'));