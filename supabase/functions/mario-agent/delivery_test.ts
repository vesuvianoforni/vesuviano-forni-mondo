import { deliveryLimits, deliveryBlock, classifyReply, DAILY_EMAIL_CAP, MIN_INTERVAL_SECONDS } from '../_shared/mario/delivery-policy.ts';
function equal(a: unknown,b: unknown) { if (JSON.stringify(a)!==JSON.stringify(b)) throw new Error('Unexpected result'); }
function rejects(f:()=>unknown) { let failed=false; try { f(); } catch {failed=true;} if (!failed) throw new Error('Expected rejection'); }
Deno.test('daily cap is 100 total emails including followups',()=>{equal(DAILY_EMAIL_CAP,100);equal(deliveryLimits(100,300).daily_limit,100);rejects(()=>deliveryLimits(101,300));});
Deno.test('slow dispatch cannot go below five minutes',()=>{equal(MIN_INTERVAL_SECONDS,300);rejects(()=>deliveryLimits(100,299));});
const candidate={qualified:true,country:'UK',email:'office@pizza.co.uk',status:'new',replied_at:null,recipient_eligibility:'eligible'};
Deno.test('source verification alone does not grant delivery eligibility',()=>equal(deliveryBlock({...candidate,recipient_eligibility:'unreviewed'}),'Idoneità del destinatario non verificata.'));
Deno.test('German outreach never dispatches',()=>equal(deliveryBlock({...candidate,country:'DE'}),'Germania: contatto manuale, invio bloccato.'));
Deno.test('reply stops remaining followups',()=>equal(deliveryBlock({...candidate,replied_at:'2026-11-02'}),'Contatto fermato: risposta o esclusione registrata.'));
Deno.test('optout response stops contact',()=>equal(classifyReply('Hello','stop','office@pizza.co.uk'),'unsubscribe'));
Deno.test('bounce is not a human reply',()=>equal(classifyReply('Delivery failure','failed','mailer-daemon@provider.com'),'bounce'));