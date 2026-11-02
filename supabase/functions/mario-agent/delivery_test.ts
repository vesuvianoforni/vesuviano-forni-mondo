import { deliveryLimits, deliveryBlock, classifyReply, DAILY_EMAIL_CAP, MIN_INTERVAL_SECONDS } from '../_shared/mario/delivery-policy.ts';
function equal(a: unknown,b: unknown) { if (JSON.stringify(a)!==JSON.stringify(b)) throw new Error('Unexpected result'); }
function rejects(f:()=>unknown) { let failed=false; try { f(); } catch {failed=true;} if (!failed) throw new Error('Expected rejection'); }
Deno.test('daily cap is 200 total emails including followups',()=>{equal(DAILY_EMAIL_CAP,200);equal(deliveryLimits(200,180).daily_limit,200);rejects(()=>deliveryLimits(201,180));});
Deno.test('slow dispatch cannot go below three minutes',()=>{equal(MIN_INTERVAL_SECONDS,180);rejects(()=>deliveryLimits(100,179));});
Deno.test('Spain is a sendable market, Italy never',()=>{equal(deliveryBlock({...{qualified:true,country:'ES',email:'a@b.es',status:'new',replied_at:null,recipient_eligibility:'eligible'}}),null);equal(deliveryBlock({qualified:true,country:'IT',email:'a@b.it',status:'new',replied_at:null,recipient_eligibility:'eligible'}),'Mercato non abilitato.');});
const candidate={qualified:true,country:'UK',email:'office@pizza.co.uk',status:'new',replied_at:null,recipient_eligibility:'eligible'};
Deno.test('source verification alone does not grant delivery eligibility',()=>equal(deliveryBlock({...candidate,recipient_eligibility:'unreviewed'}),'Idoneità del destinatario non verificata.'));
Deno.test('German outreach never dispatches',()=>equal(deliveryBlock({...candidate,country:'DE'}),'Germania: contatto manuale, invio bloccato.'));
Deno.test('reply stops remaining followups',()=>equal(deliveryBlock({...candidate,replied_at:'2026-11-02'}),'Contatto fermato: risposta o esclusione registrata.'));
Deno.test('optout response stops contact',()=>equal(classifyReply('Hello','stop','office@pizza.co.uk'),'unsubscribe'));
Deno.test('bounce is not a human reply',()=>equal(classifyReply('Delivery failure','failed','mailer-daemon@provider.com'),'bounce'));