import { STARTER_TEMPLATES,renderMarioEmail,MARIO_CONTACT_EMAIL } from '../_shared/mario/templates.ts';
import { validateSequence } from '../_shared/mario/policy.ts';
import { containsPrices } from '../_shared/marketing-policy.ts';
Deno.test('pizzerias and partners each have approved-format EN FR starter sequences',()=>{
  for(const kind of ['pizzeria','partner'])for(const language of ['en','fr']){const rows=STARTER_TEMPLATES.filter(t=>t.kind===kind&&t.language===language);validateSequence(rows,containsPrices);if(rows.length!==3)throw new Error('Three steps required');}
});
Deno.test('Mario MIME preserves dedicated sender and approved text without duplicate signature',async()=>{
  const {composeEmail,rawMIME}=await import('../_shared/email-transport.ts');
  const rendered=renderMarioEmail('Test approved text','en');
  const mime=rawMIME(await composeEmail('test@example.invalid','Approved subject',rendered.text,'<test@vesuviano-forni.com>',new Date('2026-11-02'),undefined,rendered.html,'ciao@vesuviano-forni.com')).toString();
  const headers=mime.split('\r\n\r\n')[0];
  if(!/^From:.*ciao@vesuviano-forni.com/m.test(headers)||/^From:.*info@vesuvianoforni.com/m.test(headers))throw new Error('Sender isolation failed');
  if(rendered.text.split('Gennaro Caglione').length!==2)throw new Error('Duplicate signature');
});
Deno.test('Mario corporate contact is always info@vesuvianoforni.com without changing SMTP identity',()=>{
  if(MARIO_CONTACT_EMAIL!=='info@vesuvianoforni.com')throw new Error('Wrong corporate contact');
  for(const language of ['en','fr']){const rendered=renderMarioEmail('Body',language);if(!rendered.text.includes('info@vesuvianoforni.com')||rendered.text.includes('ciao@vesuviano-forni.com'))throw new Error('Contact identity failed');}
});