import { supabase } from '@/integrations/supabase/client';
import type { CommercialOffer, OfferDocument, OfferItem, PriceList } from '../../supabase/functions/commercial-offers/domain';
import defaultLogo from '@/assets/vesuviano-logo-bianco.png';
export * from '../../supabase/functions/commercial-offers/domain';
export { renderCommercialOffer } from './commercialOfferRenderer';
export async function commercialOfferAction<T>(body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke('commercial-offers', { body });
  if (error) {
    let message = 'Impossibile completare l’operazione';
    if (error.context instanceof Response) { try { const result = await error.context.json(); message = result.error || message; } catch { /* sanitized fallback */ } }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}
export async function fetchCommercialOffers() {
  const rows: CommercialOffer[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from('commercial_offers').select('*').order('created_at',{ascending:false}).order('id').range(from,from+999);
    if (error) throw error;
    rows.push(...(data ?? []) as unknown as CommercialOffer[]);
    if (!data || data.length < 1000) return rows;
  }
}
type PriceFields = { base?: number; electric?: number; rotating?: number; onSite?: number };
export interface CatalogOven { id:string; model_name:string; fuel_type:string[]; image_url:string; description?:string|null; sizes: unknown; }
export interface CatalogBurner { id:string; name:string; description?:string|null; image_url?:string|null; price:number; price_b:number|null; price_c:number|null; }
export interface OfferCatalogProduct { key:string; name:string; description:string; image_url:string; price:number|null; }
export function offerCatalog(ovens: CatalogOven[], burners: CatalogBurner[], list: PriceList): OfferCatalogProduct[] {
  const products: OfferCatalogProduct[] = [];
  const key = list === 'Reseller' ? 'listReseller' : `list${list}`;
  for (const oven of ovens) {
    const sizes = oven.sizes as { diameter:number; can_be_built_on_site?:boolean; coatings?:{name:string;image_url?:string;prices?:Record<string,PriceFields>}[] }[] | null;
    if (!Array.isArray(sizes)) continue;
    for (const size of sizes) for (const coating of size.coatings ?? []) {
      const prices = coating.prices?.[key];
      for (const fuel of oven.fuel_type ?? []) {
        const lower = fuel.toLowerCase();
        // Wood and gas share their base; burners remain distinct offer products.
        const price = lower.includes('elettr') || lower.includes('electric') ? prices?.electric : lower.includes('rotant') || lower.includes('rotating') ? prices?.rotating : prices?.base;
        products.push({ key:`oven:${oven.id}:${size.diameter}:${coating.name}:${fuel}`, name:`${oven.model_name} ${size.diameter} · ${fuel} · ${coating.name}`,
          description: oven.description ?? '', image_url: coating.image_url || oven.image_url, price: typeof price === 'number' && price >= 0 ? price : null });
      }
      if (size.can_be_built_on_site) products.push({key:`onsite:${oven.id}:${size.diameter}:${coating.name}`,name:`${oven.model_name} ${size.diameter} · Costruito sul posto · ${coating.name}`,description:'', image_url:coating.image_url || oven.image_url,price:typeof prices?.onSite === 'number' ? prices.onSite : null});
    }
  }
  for (const burner of burners) products.push({key:`burner:${burner.id}`,name:burner.name,description:burner.description ?? '',image_url:burner.image_url ?? '',
    price:list === 'Reseller' ? null : list === 'B' ? burner.price_b ?? burner.price : list === 'C' ? burner.price_c ?? burner.price : burner.price});
  return products;
}
export const emptyOfferItem = (): OfferItem => ({id:crypto.randomUUID(),product_id:null,product_name:'',description:'',image_url:'',quantity:1,unit_price:0,discount_percent:0,notes:''});
export function catalogOfferItem(product:OfferCatalogProduct,currency:OfferDocument['currency']) {
  if(product.price===null)throw new Error('Prezzo non disponibile: usa una voce libera con prezzo concordato');
  return {item:{...emptyOfferItem(),product_id:product.key,product_name:product.name,description:product.description,image_url:product.image_url,unit_price:currency==='EUR'?product.price:0},requiresManualPrice:currency!=='EUR'};
}

export async function downloadCommercialOffer(doc: OfferDocument, number: string, createdAt?: string) {
  const { renderCommercialOffer } = await import('./commercialOfferRenderer');
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'),import('jspdf')]);
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox','allow-same-origin');
  iframe.setAttribute('aria-hidden','true');
  iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:800px;height:1200px;border:0';
  document.body.appendChild(iframe);
  try {
    let html = renderCommercialOffer(doc,number,createdAt);
    let embeddedLogo: string | null = null;
    // Embed the same original white logo in the PDF; the normal preview keeps its requested www URL.
    if (doc.settings_snapshot.logo_url === 'https://www.vesuvianoforni.com/lovable-uploads/vesuviano-logo-bianco.png') {
      const response = await fetch(defaultLogo);
      if (!response.ok) throw new Error('Logo non disponibile');
      const blob = await response.blob();
      const logoData = await new Promise<string>((resolve,reject) => { const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Logo non disponibile'));reader.readAsDataURL(blob); });
      embeddedLogo = logoData;
      html = html.replace(doc.settings_snapshot.logo_url,logoData);
    }
    await new Promise<void>((resolve,reject) => { const timer = window.setTimeout(() => reject(new Error('Anteprima non disponibile')),15000); iframe.onload = () => { clearTimeout(timer); resolve(); }; iframe.srcdoc = html; });
    const frameDoc = iframe.contentDocument;
    if (!frameDoc?.body) throw new Error('Anteprima non disponibile');
    await Promise.all([...frameDoc.images].map(image => image.complete ? Promise.resolve() : new Promise<void>(resolve => { image.onload = () => resolve(); image.onerror = () => resolve(); })));
    const canvas = await html2canvas(frameDoc.body,{scale:2,useCORS:true,logging:false,windowWidth:800});
    const pdf = new jsPDF({format:'a4',unit:'mm'});
    const logoImage = frameDoc.querySelector<HTMLImageElement>('.logo img');
    const logoRect = logoImage?.getBoundingClientRect();
    const sliceHeight = Math.floor(canvas.width * 277 / 190);
    const protectedBlocks = [...frameDoc.querySelectorAll('tr,.payment-section,.info-item,.firma,.header')].map(el=>{
      const rect=el.getBoundingClientRect();return {top:Math.floor((rect.top+frameDoc.documentElement.scrollTop)*2),bottom:Math.ceil((rect.bottom+frameDoc.documentElement.scrollTop)*2)};
    });
    for (let y=0; y<canvas.height;) {
      if (y>0) pdf.addPage();
      let end=Math.min(y+sliceHeight,canvas.height);
      const crossing=protectedBlocks.find(block=>block.top>y+100&&block.top<end&&block.bottom>end&&block.bottom-block.top<sliceHeight);
      if(crossing)end=crossing.top;
      const slice=document.createElement('canvas');slice.width=canvas.width;slice.height=end-y;
      const ctx=slice.getContext('2d');if (!ctx) throw new Error('PDF non disponibile');
      ctx.drawImage(canvas,0,y,canvas.width,slice.height,0,0,canvas.width,slice.height);
      pdf.addImage(slice.toDataURL('image/jpeg',0.95),'JPEG',10,10,190,slice.height*190/canvas.width);
      if (y === 0 && embeddedLogo && logoImage?.naturalWidth && logoRect) {
        const logoCanvas=document.createElement('canvas');logoCanvas.width=Math.min(512,logoImage.naturalWidth);logoCanvas.height=Math.round(logoCanvas.width*logoImage.naturalHeight/logoImage.naturalWidth);
        const logoCtx=logoCanvas.getContext('2d');
        if(logoCtx){logoCtx.drawImage(logoImage,0,0,logoCanvas.width,logoCanvas.height);pdf.addImage(logoCanvas.toDataURL('image/png'),'PNG',10+logoRect.left*190/800,10+logoRect.top*190/800,logoRect.width*190/800,logoRect.height*190/800,undefined,'FAST');}
      }
      y=end;
    }
    pdf.save(`Offerta_${number.replace(/[^\w-]/g,'_')}.pdf`);
  } finally { iframe.remove(); }
}