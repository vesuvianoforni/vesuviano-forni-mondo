import { useMemo, useState } from 'react';
import { ArrowLeft, Copy, Download, Eye, EyeOff, Loader2, Plus, Save, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { commercialOfferAction, emptyOfferItem, offerTotals, OFFER_CURRENCIES, OFFER_LANGUAGES, OFFER_STATUSES, VAT_REGIMES, downloadCommercialOffer, type OfferDocument, type OfferStatus, type CommercialOffer, type OfferCatalogProduct } from '@/lib/commercialOffers';
import { renderCommercialOffer } from '@/lib/commercialOfferRenderer';

export interface OfferLead { id:string; company_name:string|null; contact_name:string|null; email:string|null; phone:string|null; city:string|null; country:string|null; }
interface Props { initial:OfferDocument; existing:CommercialOffer|null; initialLeadId:string|null; leads:OfferLead[]; catalog:(list:OfferDocument['price_list'])=>OfferCatalogProduct[]; onSaved:(offer:CommercialOffer)=>void; onBack:()=>void; }
export function CommercialOfferEditor({initial,existing,initialLeadId,leads,catalog,onSaved,onBack}:Props) {
  const [doc,setDoc]=useState(initial);
  const [id]=useState(()=>existing?.id ?? crypto.randomUUID());
  const [leadId,setLeadId]=useState<string|null>(initialLeadId);
  const [status,setStatus]=useState<OfferStatus>(existing?.status ?? 'offerta_pronta');
  const [busy,setBusy]=useState(false);
  const [picker,setPicker]=useState(false);
  const [search,setSearch]=useState('');
  const [leadSearch,setLeadSearch]=useState('');
  const [showPreview,setShowPreview]=useState(true);
  const [dirty,setDirty]=useState(false);
  const totals=offerTotals(doc);
  const html=useMemo(()=>renderCommercialOffer(doc,existing?.number ?? 'BOZZA',existing?.created_at),[doc,existing]);
  const change=<K extends keyof OfferDocument>(key:K,value:OfferDocument[K])=>{setDoc(prev=>({...prev,[key]:value}));setDirty(true);};
  const textField=(key:keyof OfferDocument,label:string,type='text')=><div className="space-y-1.5" key={key}><Label htmlFor={`offer-${key}`}>{label}</Label><Input id={`offer-${key}`} type={type} value={String(doc[key])} onChange={e=>change(key,e.target.value as never)}/></div>;
  const selectField=(key:keyof OfferDocument,label:string,options:Record<string,string>)=><div className="space-y-1.5"><Label>{label}</Label><Select value={String(doc[key])} onValueChange={v=>change(key,v as never)}><SelectTrigger aria-label={label}><SelectValue/></SelectTrigger><SelectContent>{Object.entries(options).map(([v,label])=><SelectItem value={v} key={v}>{label}</SelectItem>)}</SelectContent></Select></div>;
  const back=()=>{if(!dirty||window.confirm('Uscire senza salvare le modifiche?'))onBack();};
  const selectLead=(value:string)=>{
    const lead=leads.find(row=>row.id===value);setLeadId(value==='manual'?null:value);
    if(lead)setDoc(prev=>({...prev,customer_name:lead.company_name||lead.contact_name||'',customer_contact:lead.contact_name||'',customer_email:lead.email||'',customer_phone:lead.phone||'',customer_address:[lead.city,lead.country].filter(Boolean).join(', ')}));
    setDirty(true);
  };
  const save=async()=>{
    if(!doc.customer_name.trim()||!doc.title.trim()||!doc.items.length||doc.items.some(item=>!item.product_name.trim())){toast.error('Compila cliente, oggetto e almeno un prodotto con nome');return;}
    setBusy(true);
    try{
      const result=await commercialOfferAction<{offer:CommercialOffer}>({action:'save',id,lead_id:leadId,document:doc,status,...(existing?{expected_updated_at:existing.updated_at}:{})});
      setDirty(false);onSaved(result.offer);toast.success('Offerta salvata');
    }catch(error){toast.error(error instanceof Error?error.message:'Salvataggio non riuscito');}finally{setBusy(false);}
  };
  const products=catalog(doc.price_list).filter(product=>`${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase()));
  const updateItem=(index:number,key:string,value:unknown)=>change('items',doc.items.map((item,i)=>i===index?{...item,[key]:value}:item));
  const pdf=async()=>{setBusy(true);try{await downloadCommercialOffer(doc,existing?.number??'BOZZA',existing?.created_at);}catch(error){toast.error(error instanceof Error?error.message:'PDF non disponibile');}finally{setBusy(false);}};
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><Button variant="outline" size="icon" aria-label="Torna alle offerte" title="Torna alle offerte" onClick={back}><ArrowLeft/></Button><div><h1 className="text-2xl font-semibold">{existing?.number ?? 'Nuova offerta'}</h1><p className="text-sm text-muted-foreground">Vesuviano{dirty?' · Modifiche non salvate':''}</p></div></div><div className="flex flex-wrap gap-2"><Button variant="outline" size="icon" title={showPreview?'Nascondi anteprima':'Mostra anteprima'} aria-label={showPreview?'Nascondi anteprima':'Mostra anteprima'} onClick={()=>setShowPreview(!showPreview)}>{showPreview?<EyeOff/>:<Eye/>}</Button><Button variant="outline" onClick={pdf} disabled={busy}><Download/>PDF</Button><Button onClick={save} disabled={busy}>{busy?<Loader2 className="animate-spin"/>:<Save/>}Salva offerta</Button></div></div>
    <div className={`grid min-w-0 gap-6 ${showPreview?'xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]':''}`}>
      <div className="min-w-0">
        <Accordion type="multiple" defaultValue={['customer','offer','products']}>
          <AccordionItem value="customer"><AccordionTrigger>Cliente / Lead</AccordionTrigger><AccordionContent className="space-y-4">
            <Input aria-label="Cerca cliente CRM" placeholder="Cerca cliente CRM…" value={leadSearch} onChange={e=>setLeadSearch(e.target.value)}/>
            <Select value={leadId??'manual'} onValueChange={selectLead}><SelectTrigger aria-label="Cliente CRM"><SelectValue placeholder="Seleziona cliente"/></SelectTrigger><SelectContent><SelectItem value="manual">Cliente inserito manualmente</SelectItem>{leads.filter(lead=>lead.id===leadId||`${lead.company_name} ${lead.contact_name} ${lead.email}`.toLowerCase().includes(leadSearch.toLowerCase())).slice(0,150).map(lead=><SelectItem value={lead.id} key={lead.id}>{lead.company_name||lead.contact_name||lead.email||'Senza nome'}</SelectItem>)}</SelectContent></Select>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{textField('customer_name','Cliente / Ragione sociale *')}{textField('customer_contact','Nome contatto')}{textField('customer_email','Email','email')}{textField('customer_phone','Telefono')}{textField('customer_address','Indirizzo')}{textField('customer_vat','Partita IVA')}</div>
          </AccordionContent></AccordionItem>
          <AccordionItem value="offer"><AccordionTrigger>Dettagli offerta</AccordionTrigger><AccordionContent className="space-y-4">
            {textField('title','Oggetto offerta *')}<div className="space-y-1.5"><Label htmlFor="offer-description">Descrizione</Label><Textarea id="offer-description" value={doc.description} onChange={e=>change('description',e.target.value)}/></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{selectField('language','Lingua documento',Object.fromEntries(OFFER_LANGUAGES.map(v=>[v,{it:'Italiano',en:'English',fr:'Français',de:'Deutsch',es:'Español'}[v]])))}{selectField('currency','Valuta',Object.fromEntries(OFFER_CURRENCIES.map(v=>[v,v])))}{selectField('company_entity','Azienda / Conto',Object.fromEntries(Object.entries(doc.settings_snapshot.companies).map(([key,c])=>[key,c.label])))}{textField('valid_until','Valida fino al','date')}</div>
            <div className="space-y-1.5"><Label>Stato</Label><Select value={status} onValueChange={v=>{setStatus(v as OfferStatus);setDirty(true);}}><SelectTrigger aria-label="Stato offerta"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(OFFER_STATUSES).map(([v,label])=><SelectItem key={v} value={v}>{label}</SelectItem>)}</SelectContent></Select></div>
          </AccordionContent></AccordionItem>
          <AccordionItem value="products"><AccordionTrigger>Prodotti e servizi · {doc.items.length}</AccordionTrigger><AccordionContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-2"><div className="min-w-40 flex-1">{selectField('price_list','Listino di riferimento',{A:'Listino A',B:'Listino B',C:'Listino C',Reseller:'Rivenditori'})}</div><Button variant="outline" onClick={()=>setPicker(true)}><Plus/>Dal catalogo</Button><Button variant="outline" onClick={()=>change('items',[...doc.items,emptyOfferItem()])}><Plus/>Voce libera</Button></div>
            {doc.currency!=='EUR'&&<p className="text-sm text-muted-foreground">I listini sono in EUR. Inserisci i prezzi concordati in {doc.currency}; nessuna conversione automatica.</p>}
            {doc.items.length===0&&<p className="py-5 text-sm text-muted-foreground">Nessun prodotto inserito.</p>}
            {doc.items.map((item,index)=><div key={item.id} className="rounded-lg border bg-card p-4 text-card-foreground">
              <div className="mb-3 flex items-start gap-3">{item.image_url&&<img src={item.image_url} alt={item.product_name} className="h-14 w-14 shrink-0 rounded object-contain"/>}<Input aria-label={`Nome prodotto ${index+1}`} placeholder="Nome prodotto *" value={item.product_name} onChange={e=>updateItem(index,'product_name',e.target.value)} className="min-w-0 flex-1"/><Button size="icon" variant="ghost" title="Rimuovi prodotto" aria-label={`Rimuovi prodotto ${index+1}`} onClick={()=>change('items',doc.items.filter((_,i)=>i!==index))}><Trash2/></Button></div>
              <Textarea aria-label={`Descrizione prodotto ${index+1}`} rows={2} value={item.description} onChange={e=>updateItem(index,'description',e.target.value)}/>
              <div className="mt-3 grid grid-cols-3 gap-2">{(['quantity','unit_price','discount_percent'] as const).map((key,i)=><div key={key} className="min-w-0 space-y-1"><Label htmlFor={`${item.id}-${key}`} className="text-xs">{['Quantità','Prezzo unit.','Sconto %'][i]}</Label><Input id={`${item.id}-${key}`} type="number" min={key==='quantity'?0.01:0} max={key==='discount_percent'?100:undefined} step="0.01" value={item[key]} onChange={e=>updateItem(index,key,Number(e.target.value))}/></div>)}</div>
              <div className="mt-3 flex items-center justify-between"><Button variant="ghost" size="sm" onClick={()=>change('items',[...doc.items,{...item,id:crypto.randomUUID()}])}><Copy/>Duplica</Button><span className="font-semibold tabular-nums">{doc.currency} {(totals.lines[index]??0).toLocaleString('it-IT',{minimumFractionDigits:2})}</span></div>
            </div>)}
            <div className="space-y-1 border-t pt-4 text-sm"><div className="flex justify-between"><span>Imponibile</span><span>{doc.currency} {totals.subtotal.toFixed(2)}</span></div><div className="flex justify-between"><span>IVA</span><span>{doc.currency} {totals.vat.toFixed(2)}</span></div><div className="flex justify-between text-base font-semibold"><span>Totale offerta</span><span>{doc.currency} {totals.total.toFixed(2)}</span></div></div>
          </AccordionContent></AccordionItem>
          <AccordionItem value="payment"><AccordionTrigger>Pagamento e IVA</AccordionTrigger><AccordionContent className="space-y-4">{selectField('vat_regime','Regime IVA',VAT_REGIMES)}{selectField('payment_method','Metodo pagamento',{bonifico:'Bonifico bancario',contrassegno:'Contrassegno'})}{textField('payment_agreement','Accordi di pagamento')}<div className="rounded border bg-muted/30 p-3 text-sm"><p>{doc.settings_snapshot.companies[doc.company_entity].bank_holder}</p><p className="break-words">{doc.settings_snapshot.companies[doc.company_entity].bank_iban}</p><p className="text-xs text-muted-foreground">{doc.settings_snapshot.companies[doc.company_entity].bank_extra}</p></div></AccordionContent></AccordionItem>
          <AccordionItem value="timing"><AccordionTrigger>Tempistiche</AccordionTrigger><AccordionContent><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{(['timeline_produzione','timeline_consegna','timeline_installazione','timeline_collaudo'] as const).map((key,i)=>textField(key,['Produzione','Consegna','Installazione','Collaudo'][i]))}</div></AccordionContent></AccordionItem>
          <AccordionItem value="supply"><AccordionTrigger>Incluso / Escluso dalla fornitura</AccordionTrigger><AccordionContent className="space-y-4"><Label className="flex items-center gap-2"><Checkbox checked={doc.include_certification} onCheckedChange={v=>change('include_certification',v===true)}/>Certificazione di conformità</Label><div className="flex flex-wrap items-center gap-3"><Label className="flex items-center gap-2"><Checkbox checked={doc.include_warranty} onCheckedChange={v=>change('include_warranty',v===true)}/>Garanzia</Label><Input className="w-20" type="number" min="1" max="10" aria-label="Anni garanzia" value={doc.warranty_years} onChange={e=>change('warranty_years',Number(e.target.value))}/><span className="text-sm">anni</span></div><Label htmlFor="offer-inclusions">Altre voci incluse</Label><Textarea id="offer-inclusions" value={doc.inclusions} onChange={e=>change('inclusions',e.target.value)}/><Label htmlFor="offer-exclusions">Esclusioni</Label><Textarea id="offer-exclusions" value={doc.exclusions} onChange={e=>change('exclusions',e.target.value)}/></AccordionContent></AccordionItem>
        </Accordion>
      </div>
      {showPreview&&<div className="min-w-0 xl:sticky xl:top-20 xl:self-start"><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold">Anteprima offerta</h2><span className="text-xs text-muted-foreground">{doc.language.toUpperCase()} · {doc.currency}</span></div><iframe title="Anteprima offerta commerciale" sandbox="" srcDoc={html} className="h-[720px] w-full rounded-lg border bg-card"/></div>}
    </div>
    <Dialog open={picker} onOpenChange={setPicker}><DialogContent className="max-h-[85dvh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>Catalogo · Listino {doc.price_list}</DialogTitle><DialogDescription>Forni e bruciatori Vesuviano</DialogDescription></DialogHeader><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><Input className="pl-9" placeholder="Cerca modello, taglia, rivestimento…" value={search} onChange={e=>setSearch(e.target.value)} aria-label="Cerca prodotto"/></div><div className="divide-y">{products.map(product=><div className="flex items-center gap-3 py-3" key={product.key}>{product.image_url&&<img src={product.image_url} alt={product.name} className="h-16 w-16 shrink-0 object-contain"/>}<div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{product.price===null?'Prezzo non disponibile':`EUR ${product.price.toLocaleString('it-IT')}`}</p></div><Button variant="outline" size="icon" aria-label={`Aggiungi ${product.name}`} title="Aggiungi prodotto" onClick={()=>{change('items',[...doc.items,{...emptyOfferItem(),product_id:product.key,product_name:product.name,description:product.description,image_url:product.image_url,unit_price:doc.currency==='EUR'?(product.price??0):0}]);setPicker(false);}}><Plus/></Button></div>)}{products.length===0&&<p className="py-5 text-sm text-muted-foreground">Nessun prodotto trovato.</p>}</div></DialogContent></Dialog>
  </div>;
}