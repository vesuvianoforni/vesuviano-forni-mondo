import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import { downloadCommercialOffer, type OfferDocument } from '@/lib/commercialOffers';
import { renderCommercialOffer } from '@/lib/commercialOfferRenderer';
import { toast } from 'sonner';

export default function PublicCommercialOffer() {
  const {code}=useParams();
  const [offer,setOffer]=useState<{number:string;document:OfferDocument;created_at:string}|null>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    let active=true;
    const load=async()=>{
      setLoading(true);setError('');
      try{
        if(!code||!/^[0-9a-f-]{36}$/i.test(code))throw new Error('Offerta non disponibile');
        const {data,error}=await supabase.functions.invoke(`commercial-offers?code=${encodeURIComponent(code)}`,{method:'GET'});
        if(error||!data?.offer)throw new Error('Offerta non disponibile o scaduta');
        if(active)setOffer(data.offer);
      }catch(e){if(active)setError(e instanceof Error?e.message:'Offerta non disponibile');}finally{if(active)setLoading(false);}
    };
    void load();return()=>{active=false;};
  },[code]);
  const pdf=async()=>{if(!offer)return;setBusy(true);try{await downloadCommercialOffer(offer.document,offer.number,offer.created_at);}catch{toast.error('PDF non disponibile');}finally{setBusy(false);}};
  return <div className="min-h-dvh bg-background text-foreground"><SEOHead title={offer?`Offerta ${offer.number} | Vesuviano`:'Offerta | Vesuviano'} description="Offerta commerciale personalizzata Vesuviano Forni." lang={offer?.document.language??'it'} noIndex/>
    {loading?<div className="flex min-h-dvh items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>:error?<div className="flex min-h-dvh items-center justify-center p-6"><p role="alert" className="text-muted-foreground">{error}</p></div>:offer&&<><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 border-b px-4 py-3"><span className="text-sm font-semibold">Vesuviano · {offer.number}</span><Button onClick={pdf} disabled={busy}>{busy?<Loader2 className="animate-spin"/>:<Download/>}PDF</Button></div><iframe title="Offerta Vesuviano" sandbox="" className="min-h-[calc(100dvh-70px)] w-full border-0" srcDoc={renderCommercialOffer(offer.document,offer.number,offer.created_at)}/></>}
  </div>;
}