import { STARTER_TEMPLATES,renderMarioEmail } from '../_shared/mario/templates.ts';
import { validateSequence } from '../_shared/mario/policy.ts';
import { containsPrices } from '../_shared/marketing-policy.ts';
Deno.test('pizzerias and partners each have approved-format EN FR starter sequences',()=>{
  for(const kind of ['pizzeria','partner'])for(const language of ['en','fr']){const rows=STARTER_TEMPLATES.filter(t=>t.kind===kind&&t.language===language);validateSequence(rows,containsPrices);if(rows.length!==3)throw new Error('Three steps required');}
});
Deno.test('Mario MIME preserves dedicated sender and approved text without duplicate signature',async()=>{
  const {composeEmail,rawMIME}=await import('../_shared/email-transport.ts');
  const rendered=renderMarioEmail('Test approved text','en');
  const mime=rawMIME(await composeEmail('test@example.invalid','Approved subject',rendered.text,'<test@vesuviano-forni.com>',new Date('2026-11-02'),undefined,rendered.html,'ciao@vesuviano-forni.com')).toString();
  if(!mime.includes('ciao@vesuviano-forni.com')||mime.includes('info@vesuvianoforni.com'))throw new Error('Sender isolation failed');
  if(rendered.text.split('Gennaro Caglione').length!==2)throw new Error('Duplicate signature');
});