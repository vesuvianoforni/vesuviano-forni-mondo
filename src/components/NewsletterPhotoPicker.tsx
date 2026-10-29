import { useState } from 'react';
import { Check, ImagePlus, Plus, Search, Star, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Asset = { url: string; label: string };
type PhotoSelection = { image_url: string | null; extra_images: string[] };
type Props = {
  assets: Asset[];
  imageUrl: string | null;
  extraImages: string[];
  disabled: boolean;
  unsaved: boolean;
  onChange: (selection: PhotoSelection) => void;
};

function PhotoAction({ label, children, onClick, disabled = false }: {
  label: string; children: React.ReactNode; onClick: () => void; disabled?: boolean;
}) {
  return <Tooltip><TooltipTrigger asChild>
    <Button type="button" variant="outline" size="icon" aria-label={label} disabled={disabled} onClick={onClick} className="h-8 w-8 shrink-0">
      {children}
    </Button>
  </TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>;
}

export default function NewsletterPhotoPicker({ assets, imageUrl, extraImages, disabled, unsaved, onChange }: Props) {
  const [mode, setMode] = useState<'main' | 'extra' | null>(null);
  const [filter, setFilter] = useState('');
  const [enlarged, setEnlarged] = useState<Asset | null>(null);
  const photo = (url: string, fallback: string): Asset => assets.find((asset) => asset.url === url) || { url, label: fallback };
  const openPicker = (next: 'main' | 'extra') => { setFilter(''); setMode(next); };
  const choose = (url: string) => {
    if (disabled) return;
    if (mode === 'main') onChange({ image_url: url, extra_images: extraImages.filter((image) => image !== url) });
    else if (mode === 'extra' && url !== imageUrl && !extraImages.includes(url) && extraImages.length < 3) {
      onChange({ image_url: imageUrl, extra_images: [...extraImages, url] });
    } else return;
    setMode(null);
  };
  const matching = assets.filter((asset) => asset.label.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase()));

  return <TooltipProvider delayDuration={150}>
    <section aria-label="Foto della newsletter" className="space-y-4 border-t pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Foto della newsletter</h3>
        {unsaved && <Badge variant="outline">Modifiche non salvate</Badge>}
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium">Foto principale</span>
          {!disabled && <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => openPicker('main')}>
              <ImagePlus className="h-4 w-4" />{imageUrl ? 'Sostituisci' : 'Scegli foto'}
            </Button>
            {imageUrl && <PhotoAction label="Rimuovi foto principale" onClick={() => onChange({ image_url: null, extra_images: extraImages })}><X /></PhotoAction>}
          </div>}
        </div>
        {imageUrl ? <>
          <Button type="button" variant="ghost" aria-label="Ingrandisci foto principale" onClick={() => setEnlarged(photo(imageUrl, 'Foto principale'))}
            className="group relative block h-auto w-full aspect-[16/10] overflow-hidden rounded-md border bg-muted/30 p-2 hover:bg-muted/50">
            <img src={imageUrl} alt={photo(imageUrl, 'Foto principale').label} className="h-full w-full object-contain" />
            <span className="absolute bottom-2 right-2 rounded-md border bg-background p-2 text-foreground"><ZoomIn className="h-4 w-4" /></span>
          </Button>
          <p className="break-words text-xs text-muted-foreground">{photo(imageUrl, 'Foto principale').label}</p>
        </> : <div className="flex aspect-[16/10] items-center justify-center rounded-md border border-dashed bg-muted/30 text-sm text-muted-foreground">Nessuna foto principale</div>}
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium">Foto aggiuntive</span>
          <Badge variant="secondary">{extraImages.length} / 3</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((index) => {
            const url = extraImages[index];
            if (!url) return <div key={index} className="min-w-0">
              <Button type="button" variant="outline" aria-label={`Aggiungi foto aggiuntiva ${index + 1}`} disabled={disabled}
                onClick={() => openPicker('extra')} className="h-auto w-full aspect-square flex-col gap-1 whitespace-normal border-dashed bg-muted/20 px-1 py-2 text-xs">
                <Plus className="h-5 w-5" /><span>Aggiungi foto</span>
              </Button>
            </div>;
            const asset = photo(url, `Foto aggiuntiva ${index + 1}`);
            return <div key={url} className="min-w-0 space-y-2">
              <Button type="button" variant="ghost" aria-label={`Ingrandisci foto aggiuntiva ${index + 1}`} onClick={() => setEnlarged(asset)}
                className="relative block h-auto w-full aspect-square overflow-hidden rounded-md border bg-muted/30 p-1">
                <img src={url} alt={asset.label} className="h-full w-full object-contain" />
                <span className="absolute bottom-1 right-1 rounded border bg-background p-1"><ZoomIn className="h-3 w-3" /></span>
              </Button>
              <p className="min-h-8 break-words text-xs leading-4 text-muted-foreground line-clamp-2" title={asset.label}>{asset.label}</p>
              {!disabled && <div className="flex flex-wrap items-center justify-between gap-1">
                <PhotoAction label={`Imposta foto aggiuntiva ${index + 1} come principale`} onClick={() => onChange({ image_url: url, extra_images: extraImages.filter((image) => image !== url) })}><Star /></PhotoAction>
                <PhotoAction label={`Rimuovi foto aggiuntiva ${index + 1}`} onClick={() => onChange({ image_url: imageUrl, extra_images: extraImages.filter((image) => image !== url) })}><X /></PhotoAction>
              </div>}
            </div>;
          })}
        </div>
      </div>
    </section>

    <Dialog open={mode !== null} onOpenChange={(open) => { if (!open) setMode(null); }}>
      <DialogContent aria-describedby={undefined} className="flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-5xl flex-col gap-4">
        <DialogHeader><DialogTitle>{mode === 'main' ? 'Scegli la foto principale' : 'Aggiungi una foto'}</DialogTitle></DialogHeader>
        <div className="relative shrink-0"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input aria-label="Cerca foto dal sito" value={filter} onChange={(event) => setFilter(event.target.value)} className="pl-9" placeholder="Cerca: pronta consegna, Ottavio, rotante…" />
        </div>
        <div className="min-h-0 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {matching.map((asset) => {
              const main = imageUrl === asset.url;
              const extraIndex = extraImages.indexOf(asset.url);
              const selected = main || extraIndex >= 0;
              return <div key={asset.url} className={`min-w-0 overflow-hidden rounded-md border ${selected ? 'border-primary' : 'border-border'}`}>
                <Button type="button" variant="ghost" aria-label={`Ingrandisci ${asset.label}`} onClick={() => setEnlarged(asset)}
                  className="relative block h-auto w-full aspect-[4/3] rounded-none bg-muted/30 p-2">
                  <img src={asset.url} alt={asset.label} loading="lazy" className="h-full w-full object-contain" />
                  <span className="absolute bottom-2 right-2 rounded border bg-background p-1"><ZoomIn className="h-4 w-4" /></span>
                </Button>
                <div className="space-y-2 p-2">
                  <p className="min-h-10 break-words text-sm leading-5 line-clamp-2" title={asset.label}>{asset.label}</p>
                  {selected && <Badge variant="secondary" className="max-w-full text-[10px]"><Check className="mr-1 h-3 w-3" />{main ? 'Principale' : `Aggiuntiva ${extraIndex + 1}`}</Badge>}
                  <Button type="button" variant={selected ? 'secondary' : 'outline'} size="sm" className="w-full px-1 text-xs" aria-label={`${mode === 'main' ? 'Usa come principale' : 'Aggiungi'}: ${asset.label}`}
                    disabled={disabled || (mode === 'extra' && (selected || extraImages.length >= 3)) || (mode === 'main' && main)} onClick={() => choose(asset.url)}>
                    {mode === 'main' ? <Star /> : <Plus />}{mode === 'main' ? 'Principale' : selected ? 'Già selezionata' : 'Aggiungi'}
                  </Button>
                </div>
              </div>;
            })}
          </div>
          {matching.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">{assets.length ? 'Nessuna foto trovata' : 'Nessuna foto disponibile'}</p>}
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={enlarged !== null} onOpenChange={(open) => { if (!open) setEnlarged(null); }}>
      <DialogContent aria-describedby={undefined} className="w-[calc(100%-2rem)] max-w-5xl">
        <DialogHeader><DialogTitle className="pr-6 break-words">{enlarged?.label}</DialogTitle></DialogHeader>
        {enlarged && <img src={enlarged.url} alt={enlarged.label} className="h-[65dvh] w-full object-contain" />}
      </DialogContent>
    </Dialog>
  </TooltipProvider>;
}