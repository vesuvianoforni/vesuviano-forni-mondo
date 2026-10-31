import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { commercialOfferAction, VAT_REGIMES, OFFER_LANGUAGES, OFFER_CURRENCIES, type OfferSettings, type CompanyEntity } from '@/lib/commercialOffers';

export function OfferSettingsDialog({ open, onOpenChange, settings, canEdit, onSaved }: { open:boolean; onOpenChange:(open:boolean)=>void; settings:OfferSettings; canEdit:boolean; onSaved:(settings:OfferSettings)=>void }) {
  const [draft,setDraft]=useState(settings);
  const [saving,setSaving]=useState(false);
  const [entity,setEntity]=useState<CompanyEntity>('climatel');
  useEffect(()=>{if(open)setDraft(structuredClone(settings));},[open,settings]);
  const change = <K extends keyof OfferSettings>(key:K,value:OfferSettings[K])=>setDraft(prev=>({...prev,[key]:value}));
  const save = async()=>{
    setSaving(true);
    try { const result=await commercialOfferAction<{settings:OfferSettings}>({action:'save_settings',settings:draft});onSaved(result.settings);onOpenChange(false);toast.success('Impostazioni salvate'); }
    catch(error){toast.error(error instanceof Error?error.message:'Salvataggio non riuscito');}
    finally{setSaving(false);}
  };
  const field=(key:keyof OfferSettings,label:string,multiline=false)=><div className="space-y-1.5" key={key}><Label htmlFor={`setting-${key}`}>{label}</Label>{multiline?<Textarea id={`setting-${key}`} value={String(draft[key])} onChange={e=>change(key,e.target.value as never)} disabled={!canEdit}/>:<Input id={`setting-${key}`} value={String(draft[key])} onChange={e=>change(key,e.target.value as never)} disabled={!canEdit}/>}</div>;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>Impostazioni offerte Vesuviano</DialogTitle><DialogDescription>{canEdit?'Valori predefiniti per le nuove offerte. Le offerte salvate conservano le proprie condizioni.':'Impostazioni consultabili. Modifiche riservate agli amministratori.'}</DialogDescription></DialogHeader>
    <Tabs defaultValue="defaults"><TabsList className="w-full"><TabsTrigger value="defaults" className="flex-1">Condizioni</TabsTrigger><TabsTrigger value="company" className="flex-1">Azienda e banca</TabsTrigger><TabsTrigger value="brand" className="flex-1">Firma e logo</TabsTrigger></TabsList>
      <TabsContent value="defaults" className="space-y-4 py-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Azienda predefinita</Label><Select value={draft.company_entity} onValueChange={v=>change('company_entity',v as CompanyEntity)} disabled={!canEdit}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Object.entries(draft.companies).map(([key,c])=><SelectItem key={key} value={key}>{c.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label htmlFor="setting-validity">Validità (giorni)</Label><Input id="setting-validity" type="number" min="1" max="365" value={draft.validity_days} onChange={e=>change('validity_days',Number(e.target.value))} disabled={!canEdit}/></div>
          <div className="space-y-1.5"><Label>Lingua</Label><Select value={draft.language} onValueChange={v=>change('language',v as OfferSettings['language'])} disabled={!canEdit}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{OFFER_LANGUAGES.map(v=><SelectItem key={v} value={v}>{v.toUpperCase()}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Valuta</Label><Select value={draft.currency} onValueChange={v=>change('currency',v as OfferSettings['currency'])} disabled={!canEdit}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{OFFER_CURRENCIES.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Listino</Label><Select value={draft.price_list} onValueChange={v=>change('price_list',v as OfferSettings['price_list'])} disabled={!canEdit}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['A','B','C','Reseller'].map(v=><SelectItem key={v} value={v}>{v==='Reseller'?'Rivenditori':`Listino ${v}`}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Regime IVA</Label><Select value={draft.vat_regime} onValueChange={v=>change('vat_regime',v as OfferSettings['vat_regime'])} disabled={!canEdit}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Object.entries(VAT_REGIMES).map(([v,label])=><SelectItem key={v} value={v}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Metodo pagamento</Label><Select value={draft.payment_method} onValueChange={v=>change('payment_method',v as OfferSettings['payment_method'])} disabled={!canEdit}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="bonifico">Bonifico bancario</SelectItem><SelectItem value="contrassegno">Contrassegno</SelectItem></SelectContent></Select></div>
          {field('payment_agreement','Accordi di pagamento')}
          {(['timeline_produzione','timeline_consegna','timeline_installazione','timeline_collaudo'] as const).map((key,i)=>field(key,['Produzione','Consegna','Installazione','Collaudo'][i]))}
        </div>
        <div className="flex flex-wrap items-center gap-4"><Label className="flex items-center gap-2"><Checkbox checked={draft.include_certification} onCheckedChange={v=>change('include_certification',v===true)} disabled={!canEdit}/>Certificazione di conformità</Label><Label className="flex items-center gap-2"><Checkbox checked={draft.include_warranty} onCheckedChange={v=>change('include_warranty',v===true)} disabled={!canEdit}/>Garanzia</Label><Input type="number" min="1" max="10" aria-label="Anni di garanzia" className="w-20" value={draft.warranty_years} onChange={e=>change('warranty_years',Number(e.target.value))} disabled={!canEdit}/></div>
        {field('inclusions','Altre voci incluse',true)}{field('exclusions','Esclusioni predefinite',true)}
      </TabsContent>
      <TabsContent value="company" className="space-y-4 py-3"><Select value={entity} onValueChange={v=>setEntity(v as CompanyEntity)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Object.entries(draft.companies).map(([key,c])=><SelectItem key={key} value={key}>{c.label}</SelectItem>)}</SelectContent></Select>
        {Object.entries(draft.companies[entity]).map(([key,value])=><div className="space-y-1.5" key={key}><Label htmlFor={`company-${key}`}>{({label:'Nome opzione',name:'Ragione sociale',vat:'Partita IVA',address:'Indirizzo',ownership:'Titolarità del marchio',bank_holder:'Intestatario conto',bank_name:'Banca',bank_iban:'IBAN',bank_extra:'Altre coordinate'} as Record<string,string>)[key]}</Label><Textarea id={`company-${key}`} rows={key==='ownership'?3:2} value={value} disabled={!canEdit} onChange={e=>setDraft(prev=>({...prev,companies:{...prev.companies,[entity]:{...prev.companies[entity],[key]:e.target.value}}}))}/></div>)}
      </TabsContent>
      <TabsContent value="brand" className="space-y-4 py-3">{field('signature_name','Nome commerciale')}{field('signature_role','Ruolo')}{field('logo_url','Logo (URL HTTPS)')}</TabsContent>
    </Tabs>
    <div className="flex justify-end gap-2 border-t pt-4"><Button variant="outline" onClick={()=>onOpenChange(false)}>Chiudi</Button>{canEdit&&<Button onClick={save} disabled={saving}>{saving?<Loader2 className="animate-spin"/>:<Save/>}Salva impostazioni</Button>}</div>
  </DialogContent></Dialog>;
}