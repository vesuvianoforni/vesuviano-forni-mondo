import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Archive, ArchiveRestore, Copy, Download, ExternalLink, FileText, Loader2, Pencil, Plus, RefreshCw, Search, Settings, Link2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { CommercialOfferEditor, type OfferLead } from '@/components/erp/CommercialOfferEditor';
import { OfferSettingsDialog } from '@/components/erp/OfferSettingsDialog';
import { toast } from 'sonner';
import { commercialOfferAction, commercialOfferUrl, downloadCommercialOffer, fetchCommercialOffers, newOfferDocument, offerCatalog, OFFER_STATUSES, type CatalogOven, type CatalogBurner, type CommercialOffer, type OfferDocument, type OfferSettings } from '@/lib/commercialOffers';

export default function ERPOfferte() {
  const [searchParams]=useSearchParams();
  const [offers,setOffers]=useState<CommercialOffer[]>([]);
  const [settings,setSettings]=useState<OfferSettings|null>(null);
  const [canEditSettings,setCanEditSettings]=useState(false);
  const [leads,setLeads]=useState<OfferLead[]>([]);
  const [ovens,setOvens]=useState<CatalogOven[]>([]);
  const [burners,setBurners]=useState<CatalogBurner[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all');
  const [archived,setArchived]=useState(false);
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [editing,setEditing]=useState<{document:OfferDocument;offer:CommercialOffer|null;leadId:string|null}|null>(null);
  const [busy,setBusy]=useState<string|null>(null);
  const load=useCallback(async()=>{
    setLoading(true);setError('');
    try{
      const [offerRows,configuration,ovenRes,burnerRes]=await Promise.all([
        fetchCommercialOffers(),commercialOfferAction<{settings:OfferSettings;can_edit:boolean}>({action:'settings'}),
        supabase.from('configurator_ovens').select('id,model_name,fuel_type,image_url,description,sizes').eq('is_active',true),
        supabase.from('burners').select('id,name,description,image_url,price,price_b,price_c').eq('is_active',true),
      ]);
      if(ovenRes.error)throw ovenRes.error;if(burnerRes.error)throw burnerRes.error;
      const leadRows:OfferLead[]=[];
      for(let from=0;;from+=1000){const {data,error}=await supabase.from('leads').select('id,company_name,contact_name,email,phone,city,country').eq('pipeline','Vesuviano').eq('archived',false).order('company_name').order('id').range(from,from+999);if(error)throw error;leadRows.push(...(data??[]));if(!data||data.length<1000)break;}
      setOffers(offerRows);setSettings(configuration.settings);setCanEditSettings(configuration.can_edit);setOvens(ovenRes.data??[]);setBurners(burnerRes.data??[]);setLeads(leadRows);
    }catch(e){setError(e instanceof Error?e.message:'Impossibile caricare le offerte');}finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load();},[load]);
  const create=(leadId:string|null=null)=>{
    if(!settings)return;
    const document=newOfferDocument(settings);
    const lead=leads.find(row=>row.id===leadId);
    if(lead)Object.assign(document,{customer_name:lead.company_name||lead.contact_name||'',customer_contact:lead.contact_name||'',customer_email:lead.email||'',customer_phone:lead.phone||'',customer_address:[lead.city,lead.country].filter(Boolean).join(', ')});
    setEditing({document,offer:null,leadId});
  };
  const leadFilter=searchParams.get('lead');
  const rows=useMemo(()=>offers.filter(offer=>offer.archived===archived&&(!leadFilter||offer.lead_id===leadFilter)&&(filter==='all'||offer.status===filter)&&`${offer.number} ${offer.customer_name} ${offer.title}`.toLowerCase().includes(search.toLowerCase())),[offers,archived,filter,search,leadFilter]);
  const replace=(offer:CommercialOffer)=>setOffers(prev=>prev.some(row=>row.id===offer.id)?prev.map(row=>row.id===offer.id?offer:row):[offer,...prev]);
  const run=async(id:string,fn:()=>Promise<void>)=>{setBusy(id);try{await fn();}catch(e){toast.error(e instanceof Error?e.message:'Operazione non riuscita');}finally{setBusy(null);}};
  const share=(offer:CommercialOffer)=>run(offer.id,async()=>{
    let current=offer;
    if(!offer.public_enabled){if(!window.confirm('Attivare il link pubblico? Chi riceve il link potrà leggere questa offerta.'))return;const result=await commercialOfferAction<{offer:CommercialOffer}>({action:'share',id:offer.id,enabled:true,expected_updated_at:offer.updated_at});current=result.offer;replace(current);}
    await navigator.clipboard.writeText(commercialOfferUrl(current.public_code));toast.success('Link offerta copiato');
  });
  if(loading&&!settings)return <div className="flex min-h-80 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary"/></div>;
  if(error&&!settings)return <div className="p-6"><h1 className="text-2xl font-semibold">Offerte commerciali</h1><p role="alert" className="my-4 text-destructive">{error}</p><Button onClick={()=>void load()}><RefreshCw/>Riprova</Button></div>;
  return <div className="min-w-0 space-y-6 p-4 md:p-6 lg:p-8">
    <SEOHead title="Offerte commerciali | Vesuviano ERP" description="Preventivatore commerciale Vesuviano." lang="it" noIndex/>
    {editing?<CommercialOfferEditor key={editing.offer?.id??'new'} initial={editing.document} existing={editing.offer} initialLeadId={editing.leadId} leads={leads} catalog={list=>offerCatalog(ovens,burners,list)} onBack={()=>setEditing(null)} onSaved={offer=>{replace(offer);setEditing(null);}}/>:<>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Vesuviano · Vendite</p><h1 className="text-3xl font-semibold">Offerte commerciali</h1></div><div className="flex flex-wrap gap-2"><Button variant="outline" size="icon" title="Aggiorna offerte" aria-label="Aggiorna offerte" disabled={loading} onClick={()=>void load()}><RefreshCw className={loading?'animate-spin':''}/></Button><Button variant="outline" onClick={()=>setSettingsOpen(true)}><Settings/>Impostazioni</Button><Button onClick={()=>create(leadFilter)}><Plus/>Nuova offerta</Button></div></div>
      {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center gap-3"><div className="relative min-w-0 flex-1 basis-full sm:basis-64"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><Input className="pl-9" aria-label="Cerca offerte" placeholder="Cerca numero, cliente, oggetto…" value={search} onChange={e=>setSearch(e.target.value)}/></div><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-48" aria-label="Filtra stato"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tutti gli stati</SelectItem>{Object.entries(OFFER_STATUSES).map(([v,label])=><SelectItem value={v} key={v}>{label}</SelectItem>)}</SelectContent></Select><label className="flex items-center gap-2 text-sm"><Checkbox checked={archived} onCheckedChange={v=>setArchived(v===true)}/>Archiviate</label><span className="text-xs text-muted-foreground">{rows.length} offerte</span></div>
      {rows.length===0?<div className="flex min-h-80 flex-col items-center justify-center gap-3 border-y text-center"><FileText className="h-8 w-8 text-muted-foreground"/><p className="text-sm font-medium">{offers.length?'Nessuna offerta corrisponde ai filtri':'Nessuna offerta commerciale'}</p><Button variant="outline" onClick={()=>create(leadFilter)}><Plus/>Nuova offerta</Button></div>:<div className="divide-y border-y">{rows.map(offer=><div className="flex flex-wrap items-center justify-between gap-4 py-5" key={offer.id}><div className="min-w-0 flex-1 basis-64"><div className="mb-1 flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-muted-foreground">{offer.number}</span><Badge variant="outline">{OFFER_STATUSES[offer.status]}</Badge>{offer.public_enabled&&<Badge variant="secondary"><Link2 className="mr-1 h-3 w-3"/>Link attivo</Badge>}</div><h2 className="break-words font-semibold">{offer.customer_name}</h2><p className="mt-1 break-words text-sm text-muted-foreground">{offer.title}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(offer.created_at).toLocaleDateString('it-IT')} · {offer.document.language.toUpperCase()} · {offer.currency} {Number(offer.amount).toLocaleString('it-IT',{minimumFractionDigits:2})} + IVA</p></div><div className="flex flex-wrap gap-1">
        <Button variant="outline" size="icon" aria-label={`Modifica ${offer.number}`} title="Modifica offerta" disabled={busy!==null} onClick={()=>setEditing({document:structuredClone(offer.document),offer,leadId:offer.lead_id})}><Pencil/></Button>
        <Button variant="outline" size="icon" aria-label={`Duplica ${offer.number}`} title="Duplica offerta" onClick={()=>setEditing({document:structuredClone(offer.document),offer:null,leadId:offer.lead_id})}><Copy/></Button>
        <Button variant="outline" size="icon" aria-label={`PDF ${offer.number}`} title="Scarica PDF" disabled={busy!==null} onClick={()=>void run(offer.id,()=>downloadCommercialOffer(offer.document,offer.number,offer.created_at))}><Download/></Button>
        {!offer.archived&&<Button variant="outline" size="icon" aria-label={`Condividi ${offer.number}`} title="Attiva / copia link offerta" disabled={busy!==null} onClick={()=>void share(offer)}><Link2/></Button>}
        {offer.public_enabled&&<><Button variant="outline" size="icon" asChild title="Apri offerta pubblica"><a href={`/offerta/${offer.public_code}`} target="_blank" rel="noreferrer" aria-label={`Apri ${offer.number}`}><ExternalLink/></a></Button><Button variant="outline" size="icon" aria-label={`Disattiva link ${offer.number}`} title="Disattiva link pubblico" onClick={()=>void run(offer.id,async()=>{const result=await commercialOfferAction<{offer:CommercialOffer}>({action:'share',id:offer.id,enabled:false,expected_updated_at:offer.updated_at});replace(result.offer);toast.success('Link disattivato');})}><X/></Button></>}
        <Button variant="ghost" size="icon" aria-label={`${offer.archived?'Ripristina':'Archivia'} ${offer.number}`} title={offer.archived?'Ripristina offerta':'Archivia offerta'} onClick={()=>void run(offer.id,async()=>{if(!window.confirm(offer.archived?'Ripristinare l’offerta?':'Archiviare l’offerta e disattivare il link pubblico?'))return;const result=await commercialOfferAction<{offer:CommercialOffer}>({action:'archive',id:offer.id,archived:!offer.archived,expected_updated_at:offer.updated_at});replace(result.offer);})}>{offer.archived?<ArchiveRestore/>:<Archive/>}</Button>
      </div></div>)}</div>}
    </>}
    {settings&&<OfferSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} canEdit={canEditSettings} onSaved={setSettings}/>}
  </div>;
}