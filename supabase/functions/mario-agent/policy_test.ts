import { MARIO_SENDER, SEQUENCE_DAYS, canDraft, publicWebsite, businessEmail, validateSequence } from '../_shared/mario/policy.ts';
function equal(a: unknown, b: unknown) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${JSON.stringify(a)} != ${JSON.stringify(b)}`); }
function throws(f: () => unknown) { let failed=false; try { f(); } catch { failed=true; } if (!failed) throw new Error('Expected rejection'); }
const candidate = { qualified:true,email:'contact@pizzeria.co.uk',status:'new',country:'UK',replied_at:null };
Deno.test('Mario uses only dedicated outreach sender',()=>equal(MARIO_SENDER,'ciao@vesuviano-forni.com'));
Deno.test('sequence timing is day 0 3 7',()=>equal(SEQUENCE_DAYS,[0,3,7]));
Deno.test('Germany has no automatic draft sequence',()=>equal(canDraft({...candidate,country:'DE'}),'Germania: raccolta per revisione manuale, nessuna sequenza automatica.'));
Deno.test('reply prevents followup sequence',()=>equal(canDraft({...candidate,replied_at:'2026-11-02'}),'Prospect già contattato o escluso: sequenza bloccata.'));
Deno.test('unqualified prospect cannot draft',()=>equal(canDraft({...candidate,qualified:false}),'Verifica prima la pertinenza e le fonti del prospect.'));
Deno.test('missing email prevents draft',()=>equal(canDraft({...candidate,email:null}),'Manca un’email aziendale verificata sul sito ufficiale.'));
Deno.test('UK verified prospect can draft',()=>equal(canDraft(candidate),null));
Deno.test('private addresses rejected',()=>{for(const u of ['http://site.com','https://127.0.0.1','https://localhost','https://foo.internal','https://[::1]','https://user:password@site.com']) throws(()=>publicWebsite(u));});
Deno.test('canonical domain ignores www',()=>equal(publicWebsite('https://www.pizzeria.co.uk/contact').domain,'pizzeria.co.uk'));
Deno.test('email requires literal official-domain evidence',()=>{ equal(businessEmail('hello@pizza.com','pizza.com','Write hello@pizza.com'),'hello@pizza.com'); equal(businessEmail('invented@pizza.com','pizza.com','Contact us'),null); equal(businessEmail('hello@another.com','pizza.com','hello@another.com'),null); });
Deno.test('outreach prices are blocked',()=>{ const messages=[0,1,2].map(step=>({step,subject:'Discuss your oven',body:'a'.repeat(90)+' £100'})); throws(()=>validateSequence(messages,s=>s.includes('£100'))); });
Deno.test('exact three draft steps required',()=>throws(()=>validateSequence([{step:0,subject:'Hello',body:'a'.repeat(100)}],()=>false)));
Deno.test('false reply subjects blocked',()=>throws(()=>validateSequence([0,1,2].map(step=>({step,subject:'Re: our previous talk',body:'a'.repeat(100)})),()=>false)));
Deno.test('no arbitrary URL or HTML in generated draft',()=>throws(()=>validateSequence([0,1,2].map(step=>({step,subject:'Forni',body:'a'.repeat(100)+' https://malicious.com'})),()=>false)));