import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toggleMaterialProduct, type MaterialProduct } from "@/lib/materialProducts";

export default function MaterialProductPicker({ products, value, onChange, disabled = false }: {
  products: MaterialProduct[]; value: string[]; onChange: (ids: string[]) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const label = value.length ? `${value.length} prodott${value.length === 1 ? "o" : "i"} selezionat${value.length === 1 ? "o" : "i"}` : "Materiale aziendale";
  return (
    <div className="min-w-0 space-y-2">
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-label="Prodotti collegati" aria-expanded={open} disabled={disabled} className="w-full min-w-52 justify-between font-normal">
            <span className="truncate">{label}</span><ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Cerca prodotto..." />
            <CommandList>
              <CommandEmpty>Nessun prodotto trovato</CommandEmpty>
              <CommandItem value="materiale aziendale" onSelect={() => onChange([])}>
                <Check className={`mr-2 h-4 w-4 shrink-0 ${value.length ? "opacity-0" : "opacity-100"}`} />Materiale aziendale
              </CommandItem>
              {products.map((product) => (
                <CommandItem key={product.id} value={product.id} keywords={[product.name]} onSelect={() => onChange(toggleMaterialProduct(value, product.id))} className="items-start gap-2">
                  <span role="checkbox" aria-checked={value.includes(product.id)} aria-label={product.name} className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${value.includes(product.id) ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}>
                    {value.includes(product.id) && <Check className="h-3 w-3" />}
                  </span>
                  <span className="min-w-0 break-words">{product.name}</span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
          <div className="flex justify-end border-t p-2"><Button size="sm" onClick={() => setOpen(false)}>Fatto</Button></div>
        </PopoverContent>
      </Popover>
      {!!value.length && <div className="flex max-h-32 flex-wrap gap-1 overflow-y-auto">
        {value.map((id) => {
          const name = products.find((product) => product.id === id)?.name ?? "Prodotto collegato";
          return <Badge key={id} variant="secondary" className="max-w-full gap-1 py-1 pr-1 font-normal">
            <span className="min-w-0 break-words">{name}</span>
            <Button type="button" size="icon" variant="ghost" disabled={disabled} aria-label={`Scollega ${name}`} className="h-5 w-5 shrink-0" onClick={() => onChange(value.filter((item) => item !== id))}><X className="h-3 w-3" /></Button>
          </Badge>;
        })}
      </div>}
    </div>
  );
}