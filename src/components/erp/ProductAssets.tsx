import { useEffect, useState } from "react";
import { FileText, Loader2, Paperclip, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const db = supabase as any;
const BUCKET = "oven-gallery";
const KINDS = [["foto", "Foto"], ["video", "Video"], ["scheda", "Scheda tecnica"], ["catalogo", "Catalogo"], ["documento", "Documento"]] as const;
interface Asset { id: string; kind: string; title: string; url: string; storage_path: string | null }

/** Photos, videos and documents of one product that Bruno can send to customers. */
export function ProductAssets({ productId, productName }: { productId: string; productName: string }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Asset[]>([]);
  const [kind, setKind] = useState("foto");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await db.from("product_assets").select("id,kind,title,url,storage_path").eq("product_id", productId).order("created_at");
    setRows(data ?? []);
  };
  useEffect(() => { if (open) load(); }, [open]);

  const upload = async (file: File) => {
    setBusy(true);
    const path = `product-assets/${productId}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (error) { setBusy(false); return toast.error(error.message); }
    const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const { error: e2 } = await db.from("product_assets").insert({ product_id: productId, kind, title: title.trim() || `${productName} · ${file.name}`, url, storage_path: path });
    setBusy(false);
    if (e2) return toast.error(e2.message);
    setTitle(""); load(); toast.success("File caricato");
  };
  const remove = async (a: Asset) => {
    if (a.storage_path) await supabase.storage.from(BUCKET).remove([a.storage_path]);
    await db.from("product_assets").delete().eq("id", a.id); load();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="icon" variant="ghost" aria-label="File del prodotto" title="Foto, video e documenti"><Paperclip className="h-4 w-4" /></Button></DialogTrigger>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>File · {productName}</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground">Bruno può inviare questi file ai clienti su WhatsApp Gennaro o via email.</p>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={kind} onValueChange={setKind}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{KINDS.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
          <Input className="min-w-40 flex-1" placeholder="Titolo (es. Scheda tecnica Real Bosco 120)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button asChild disabled={busy}><label className="cursor-pointer">{busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}Carica
            <input type="file" className="hidden" accept="image/*,video/*,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} /></label></Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {rows.map((a) => (
            <div key={a.id} className="flex items-center gap-2 rounded-lg border p-2">
              {a.kind === "foto" ? <img src={a.url} alt="" className="h-12 w-12 rounded object-cover" loading="lazy" /> : a.kind === "video" ? <video src={a.url} className="h-12 w-12 rounded object-cover" muted /> : <FileText className="h-8 w-8 text-muted-foreground" />}
              <a href={a.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm hover:underline">{a.title}<span className="block text-xs text-muted-foreground">{a.kind}</span></a>
              <Button size="icon" variant="ghost" aria-label="Elimina" onClick={() => remove(a)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {!rows.length && <p className="text-sm text-muted-foreground">Nessun file caricato.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
