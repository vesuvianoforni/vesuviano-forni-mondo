import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, ExternalLink, Loader2, Pencil, Search, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import MaterialPreview from "@/components/erp/MaterialPreview";
import MaterialProductPicker from "@/components/erp/MaterialProductPicker";
import { materialUploadKind } from "@/lib/materialFiles";
import { materialMatchesProduct, materialProductIds, materialProductNames, type LinkedMaterial } from "@/lib/materialProducts";

const db = supabase as any;
const BUCKET = "oven-gallery";
const KINDS = [["foto", "Foto"], ["video", "Video"], ["scheda", "Scheda tecnica"], ["catalogo", "Catalogo"], ["certificazione", "Certificazione"], ["documento", "Documento"]] as const;
const LANGS = [["all", "Universale"], ["it", "Italiano"], ["en", "Inglese"], ["fr", "Francese"], ["de", "Tedesco"], ["es", "Spagnolo"]] as const;
const GENERAL = "general";
interface Asset extends LinkedMaterial { id: string; kind: string; title: string; url: string; storage_path: string | null; language: string | null; tags: string[] }
interface Product { id: string; name: string }

/** Product picker with an inline search box, so many models stay easy to reach. */
function ProductPicker({ products, value, onChange, withAny = false }: { products: Product[]; value: string; onChange: (v: string) => void; withAny?: boolean }) {
  const [open, setOpen] = useState(false);
  const label = value === "any" ? "Tutti" : value === GENERAL ? "Materiale aziendale" : products.find((p) => p.id === value)?.name ?? "Seleziona prodotto";
  const pick = (v: string) => { onChange(v); setOpen(false); };
  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-52 justify-between font-normal">
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Cerca prodotto..." />
          <CommandList>
            <CommandEmpty>Nessun prodotto trovato</CommandEmpty>
            {withAny && <CommandItem value="tutti" onSelect={() => pick("any")}>Tutti</CommandItem>}
            <CommandItem value="materiale aziendale" onSelect={() => pick(GENERAL)}>
              <Check className={`mr-1 h-4 w-4 ${value === GENERAL ? "opacity-100" : "opacity-0"}`} />Materiale aziendale
            </CommandItem>
            {products.map((p) => (
              <CommandItem key={p.id} value={p.name} onSelect={() => pick(p.id)}>
                <Check className={`mr-1 h-4 w-4 ${value === p.id ? "opacity-100" : "opacity-0"}`} />{p.name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Media library Bruno uses: files linked to a product or general company material. */
export default function ERPMateriali() {
  const [dragging, setDragging] = useState(false);
  const [rows, setRows] = useState<Asset[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ productIds: [] as string[], kind: "foto", language: "all", title: "", tags: "" });
  const [filter, setFilter] = useState({ q: "", product: "any", kind: "any", lang: "any" });

  const load = async () => {
    const { data, error } = await db.from("product_assets").select("id,kind,title,url,storage_path,language,tags,product_id,products!product_assets_product_id_fkey(name),product_asset_links!product_asset_links_asset_id_fkey(product_id,products!product_asset_links_product_id_fkey(id,name))").order("created_at", { ascending: false }).limit(1000);
    if (error) toast.error("Impossibile caricare i materiali");
    else setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => {
    load();
    db.from("products").select("id,name").order("name").then(({ data, error }: any) => {
      if (error) toast.error("Impossibile caricare i prodotti");
      else setProducts(data ?? []);
    });
  }, []);

  const upload = async (files: File[]) => {
    if (!files.length || busy) return;
    setBusy(true);
    let uploaded = 0;
    for (const file of files) {
      const folder = form.productIds[0] ?? "general";
      const path = `product-assets/${folder}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      if (error) { toast.error(`${file.name}: ${error.message}`); continue; }
      const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      const tags = form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      const title = form.title.trim() ? (files.length > 1 ? `${form.title.trim()} · ${file.name}` : form.title.trim()) : file.name.replace(/\.[^.]+$/, "");
      const { error: e2 } = await db.rpc("save_product_material", {
        _id: null, _product_ids: form.productIds,
        _fields: { kind: materialUploadKind(file.name, file.type, form.kind), title, url, storage_path: path,
          language: form.language === "all" ? null : form.language, tags },
      });
      if (e2) {
        toast.error(`${file.name}: ${e2.message}`);
        await supabase.storage.from(BUCKET).remove([path]);
      } else uploaded++;
    }
    setBusy(false);
    if (uploaded) { setForm((f) => ({ ...f, title: "" })); load(); toast.success("Materiale caricato"); }
  };
  const remove = async (a: Asset) => {
    if (!confirm(`Eliminare "${a.title}"?`)) return;
    if (a.storage_path) await supabase.storage.from(BUCKET).remove([a.storage_path]);
    await db.from("product_assets").delete().eq("id", a.id); load();
  };
  const [edit, setEdit] = useState<{ id: string; url: string; title: string; kind: string; language: string; productIds: string[]; tags: string } | null>(null);
  const openEdit = (a: Asset) => setEdit({ id: a.id, url: a.url, title: a.title, kind: a.kind, language: a.language ?? "all", productIds: materialProductIds(a), tags: (a.tags || []).join(", ") });
  const saveEdit = async () => {
    if (!edit) return;
    setBusy(true);
    const { error } = await db.rpc("save_product_material", {
      _id: edit.id, _product_ids: edit.productIds,
      _fields: { title: edit.title.trim(), kind: edit.kind, language: edit.language === "all" ? null : edit.language,
        tags: edit.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setEdit(null); load(); toast.success("Materiale aggiornato");
   return undefined; };

  const visible = useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    return rows.filter((a) =>
      (filter.kind === "any" || a.kind === filter.kind) &&
      (filter.lang === "any" || (filter.lang === "all" ? !a.language : a.language === filter.lang)) &&
      materialMatchesProduct(a, filter.product) &&
      (!q || [a.title, ...materialProductNames(a), ...(a.tags || [])].join(" ").toLowerCase().includes(q)));
  }, [rows, filter]);

  const productSelect = (value: string, onChange: (v: string) => void, withAny = false) => (
    <ProductPicker products={products} value={value} onChange={onChange} withAny={withAny} />
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SEOHead title="Materiali | ERP Vesuviano" description="Libreria foto, video e documenti per Bruno" />
      <div>
        <h1 className="text-2xl font-semibold">Materiali</h1>
        <p className="text-sm text-muted-foreground">Foto, video, schede e documenti. Bruno li trova per modello, titolo o tag e li invia su WhatsApp Gennaro (allegato) o per email (link).</p>
      </div>

      <section
        className={`relative space-y-3 rounded-lg border bg-card p-4 transition-colors ${dragging ? "border-primary bg-primary/5" : ""}`}
        onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); if (e.currentTarget.contains(e.relatedTarget as Node)) return; setDragging(false); }}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false);
          const files = Array.from(e.dataTransfer.files).filter((f) => /^(image\/|video\/|application\/pdf)/.test(f.type));
          if (files.length < e.dataTransfer.files.length) toast.info("Sono ammessi solo foto, video e PDF; gli altri file sono stati ignorati");
          if (files.length) upload(files);
        }}
      >
        <h2 className="font-medium">Carica nuovo materiale</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full min-w-0 sm:max-w-md"><MaterialProductPicker products={products} value={form.productIds} onChange={(productIds) => setForm({ ...form, productIds })} disabled={busy} /></div>
          <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{KINDS.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
          <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{LANGS.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input className="min-w-56 flex-1" placeholder="Titolo (es. Scheda tecnica Ottavio 120 EN)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input className="min-w-56 flex-1" placeholder="Tag separati da virgola (es. imballo, laboratorio)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <Button asChild disabled={busy}><label className="cursor-pointer">{busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}Scegli file
            <input type="file" multiple className="hidden" accept="image/*,video/*,application/pdf" onChange={(e) => { if (e.target.files?.length) upload(Array.from(e.target.files)); e.target.value = ""; }} /></label></Button>
        </div>
        <div className={`flex items-center justify-center gap-2 rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground ${dragging ? "border-primary text-primary" : ""}`}>
          <Upload className="h-4 w-4" />{dragging ? "Rilascia qui i file per caricarli" : "Trascina qui foto, video o PDF"}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Cerca per titolo, modello o tag" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} /></div>
          {productSelect(filter.product, (v) => setFilter({ ...filter, product: v }), true)}
          <Select value={filter.kind} onValueChange={(v) => setFilter({ ...filter, kind: v })}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="any">Tutti i tipi</SelectItem>{KINDS.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
          <Select value={filter.lang} onValueChange={(v) => setFilter({ ...filter, lang: v })}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="any">Qualsiasi lingua</SelectItem>{LANGS.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
        </div>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((a) => (
              <div key={a.id} className="overflow-hidden rounded-lg border bg-card">
                <Button type="button" variant="ghost" onClick={() => openEdit(a)} aria-label={`Modifica ${a.title}`} className="flex aspect-video h-auto w-full items-center justify-center overflow-hidden rounded-none bg-muted p-0">
                  <MaterialPreview url={a.url} title={a.title} />
                </Button>
                <div className="space-y-1 p-3">
                  <div className="flex items-start gap-2">
                    <Button type="button" variant="link" onClick={() => openEdit(a)} className="h-auto min-w-0 flex-1 justify-start whitespace-normal break-words p-0 text-left text-sm font-medium text-foreground">{a.title}</Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Modifica" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Elimina" onClick={() => remove(a)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <p className="break-words text-xs text-muted-foreground">{materialProductNames(a).join(", ") || "Materiale aziendale"} · {KINDS.find(([k]) => k === a.kind)?.[1] ?? a.kind} · {LANGS.find(([k]) => k === (a.language ?? "all"))?.[1]}</p>
                  {!!a.tags?.length && <div className="flex flex-wrap gap-1">{a.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>}
                </div>
              </div>
            ))}
            {!visible.length && <p className="text-sm text-muted-foreground">Nessun materiale.</p>}
          </div>
        )}
      </section>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>Modifica materiale</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div className="flex h-64 items-center justify-center overflow-hidden rounded-md bg-muted">
                <MaterialPreview url={edit.url} title={edit.title} expanded />
              </div>
              <a href={edit.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline"><ExternalLink className="h-4 w-4" />Apri file</a>
              <div className="space-y-1"><Label>Titolo</Label><Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></div>
              <div className="space-y-1"><Label>Prodotti collegati</Label><MaterialProductPicker products={products} value={edit.productIds} onChange={(productIds) => setEdit({ ...edit, productIds })} disabled={busy} /></div>
              <div className="flex flex-wrap gap-3">
                <div className="space-y-1"><Label>Tipo</Label>
                  <Select value={edit.kind} onValueChange={(v) => setEdit({ ...edit, kind: v })}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>{KINDS.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1"><Label>Lingua</Label>
                  <Select value={edit.language} onValueChange={(v) => setEdit({ ...edit, language: v })}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>{LANGS.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="space-y-1"><Label>Tag (separati da virgola)</Label><Input value={edit.tags} onChange={(e) => setEdit({ ...edit, tags: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Annulla</Button>
            <Button onClick={saveEdit} disabled={busy || !edit?.title.trim()}>{busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
