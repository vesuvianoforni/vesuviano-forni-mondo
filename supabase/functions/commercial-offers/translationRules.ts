import type { OfferDocument, OfferLanguage } from './domain.ts';
export const OFFER_TEXT_FIELDS = ['title','description','inclusions','exclusions','payment_agreement','timeline_produzione','timeline_consegna','timeline_installazione','timeline_collaudo'] as const;
type InputDocument = Omit<OfferDocument,'settings_snapshot'>;
export type OfferTranslatedTexts = Record<typeof OFFER_TEXT_FIELDS[number],string> & { items:{id:string;description:string;notes:string}[] };
const numberTokens = (value:string) => (value.match(/\d+(?:[.,]\d+)*/g)??[]).sort().join('|');
const preserved = (before:string,after:string) => numberTokens(before)===numberTokens(after) && (before.trim() ? Boolean(after.trim()) : !after.trim());
export function applyOfferTranslation(doc:InputDocument, output:OfferTranslatedTexts, target:OfferLanguage):InputDocument {
  for(const field of OFFER_TEXT_FIELDS) if(!preserved(doc[field],output[field])) throw new Error('Traduzione da verificare: valori o campi non conservati');
  const ids=new Set(output.items.map(item=>item.id));
  if(output.items.length!==doc.items.length||ids.size!==output.items.length)throw new Error('Traduzione prodotto non valida');
  const items=doc.items.map(item=>{
    const translated=output.items.find(row=>row.id===item.id);
    if(!translated||!preserved(item.description,translated.description)||!preserved(item.notes,translated.notes))throw new Error('Traduzione prodotto non valida');
    return {...item,description:translated.description,notes:translated.notes};
  });
  return {...doc,...Object.fromEntries(OFFER_TEXT_FIELDS.map(field=>[field,output[field]])),items,language:target};
}