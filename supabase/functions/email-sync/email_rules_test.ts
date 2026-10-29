import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { canSubmitSMTP, canAppendSent, discoverSent, nextUIDBatch, chooseLead, safeMailError } from '../_shared/email-rules.ts';

Deno.test('SMTP accepted emails are never resent',()=>assertEquals(canSubmitSMTP('accepted'),false));
Deno.test('SMTP unknown acknowledgement is never resent',()=>assertEquals(canSubmitSMTP('unknown'),false));
Deno.test('SMTP in flight is never resent',()=>assertEquals(canSubmitSMTP('sending'),false));
Deno.test('APPEND only after SMTP accepted',()=>assertEquals(canAppendSent('pending','pending'),false));
Deno.test('APPEND not repeated when already found',()=>assertEquals(canAppendSent('accepted','found'),false));
Deno.test('APPEND not repeated when already appended',()=>assertEquals(canAppendSent('accepted','appended'),false));
Deno.test('APPEND permitted after accepted SMTP without copy',()=>assertEquals(canAppendSent('accepted','pending'),true));
Deno.test('Sent discovery respects server namespace',()=>assertEquals(discoverSent([{path:'INBOX.Inviata',specialUse:'\\Sent',specialUseSource:'extension',flags:new Set()}]),'INBOX.Inviata'));
Deno.test('Sent discovery rejects ambiguous folder choices',()=>{ assertThrows(()=>discoverSent([{path:'Sent',flags:new Set()},{path:'Inviata',flags:new Set()}]),Error,'SENT_FOLDER_AMBIGUOUS'); });
Deno.test('UIDVALIDITY reset starts from first UID',()=>assertEquals(nextUIDBatch(900,'old','new',1000).start,1));
Deno.test('Empty UID range does not scan older messages',()=>assertEquals(nextUIDBatch(99,'v','v',100),{cursor:99,start:100,end:99}));
Deno.test('Duplicate email across clients is not arbitrarily linked',()=>assertEquals(chooseLead(['a','b']),null));
Deno.test('Thread selects a known participant from matching clients',()=>assertEquals(chooseLead(['a','b'],'b'),'b'));
Deno.test('Mail errors never reveal provider replies',()=>assertEquals(safeMailError({code:'EAUTH',message:'private provider response'}),'MAIL_AUTH_FAILED'));