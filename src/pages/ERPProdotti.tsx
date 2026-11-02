import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Copy, Loader2, Plus, Save, Search, CheckCircle2, Settings2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { CURRENCIES, DEFAULT_MARKET_CURRENCY, MARKETS, MARKET_LABELS, Market } from "@/lib/productPricing";

const db = supabase as any;
type Category = "forno" | "bruciatore" | "altro";
interface PriceList { id: string; year: number; status: "draft" | "active" | "archived" }
interface Product { id: string; category: Category; name: string; description: string | null; image_url: string | null; cost: number | null; cost_currency: string; is_active: boolean; sort_order: number }
interface Price { amount: number | null; currency: string }
interface Tier { code: string; label: string; percentage: number }
type Row = { product: Product; prices: Record<Market, Price> };

const STATUS_LABEL = { draft: "Bozza", active: "Attivo", archived: "Archiviato" } as const;
const emptyPrices = (): Record<Market, Price> => ({ UK: { amount: null, currency: DEFAULT_MARKET_CURRENCY.UK }, FR: { amount: null, currency: "EUR" }, DE: { amount: null, currency: "EUR" } });
const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));

function CurrencySelect({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-8 w-[72px] px-2 text-xs" aria-label="Valuta"><SelectValue /></SelectTrigger>
      <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
    </Select>
  );
}

export default function ERPProdotti() {
  const [lists, setLists] = useState<PriceList[]>([]);
  const [listId, setListId] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("forno");
  const [adding, setAdding] = useState<Row | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const list = lists.find((l) => l.id === listId);
  const readOnly = list?.status === "archived";

  const loadLists = useCallback(async () => {
    const { data } = await db.from("price_lists").select("id,year,status").order("year", { ascending: false });
    setLists(data || []);
    setListId((cur) => cur || (data || []).find((l: PriceList) => l.status === "active")?.id || data?.[0]?.id || "");
  }, []);

  const loadRows = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    const [p, pr, t] = await Promise.all([
      db.from("products").select("id,category,name,description,image_url,is_active,sort_order").order("name").range(0, 1999),
      db.from("product_prices").select("product_id,market,amount,currency").eq("price_list_id", id).range(0, 5999),
      db.from("discount_tiers").select("code,label,percentage").order("sort_order"),
    ]);
    if (p.error || pr.error) toast.error("Errore nel caricamento del listino");
    const byProduct = new Map<string, Record<Market, Price>>();
    for (const x of pr.data || []) {
      const m = byProduct.get(x.product_id) || emptyPrices();
      m[x.market as Market] = { amount: x.amount == null ? null : Number(x.amount), currency: x.currency };
      byProduct.set(x.product_id, m);
    }
    setRows((p.data || []).map((product: Product) => ({ product, prices: byProduct.get(product.id) || emptyPrices() })));
    setTiers((t.data || []).map((x: Tier) => ({ ...x, percentage: Number(x.percentage) })));
    setDirty(new Set());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLists();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: ok } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      setIsAdmin(!!ok);
    });
  }, [loadLists]);
  useEffect(() => { loadRows(listId); }, [listId, loadRows]);

  const update = (id: string, fn: (r: Row) => Row) => {
    setRows((rs) => rs.map((r) => (r.product.id === id ? fn(r) : r)));
    setDirty((d) => new Set(d).add(id));
  };

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => r.product.category === tab && r.product.name.toLowerCase().includes(q));
  }, [rows, tab, search]);

  const savePrices = async (targets: Row[]) => {
    for (const r of targets) {
      const { error: e1 } = await db.from("products").update({ name: r.product.name }).eq("id", r.product.id);
      const { error: e2 } = await db.from("product_prices").upsert(
        MARKETS.map((m) => ({ price_list_id: listId, product_id: r.product.id, market: m, amount: r.prices[m].amount, currency: r.prices[m].currency })),
        { onConflict: "price_list_id,product_id,market" },
      );
      if (e1 || e2) throw e1 || e2;
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await savePrices(rows.filter((r) => dirty.has(r.product.id)));
      if (list?.status === "active") await db.rpc("apply_active_price_list");
      toast.success(list?.status === "active" ? "Listino salvato e pubblicato su configuratore, pro-forma e offerte" : "Bozza salvata");
      setDirty(new Set());
    } catch (e: any) { toast.error(e.message || "Salvataggio non riuscito"); }
    setSaving(false);
  };

  const createProduct = async () => {
    if (!adding?.product.name.trim()) return toast.error("Inserisci il nome");
    setSaving(true);
    const { product } = adding;
    const { data, error } = await db.from("products").insert({ category: product.category, name: product.name.trim(), description: product.description, image_url: product.image_url}).select("id").single();
    if (error) { setSaving(false); return toast.error(error.message); }
    try { await savePrices([{ ...adding, product: { ...product, id: data.id } }]); } catch (e: any) { toast.error(e.message); }
    setAdding(null); setSaving(false); toast.success("Prodotto aggiunto");
    loadRows(listId);
  };

  const duplicate = async () => {
    const year = Math.max(...lists.map((l) => l.year), new Date().getFullYear()) + 1;
    if (!confirm(`Creare il listino ${year} in bozza copiando i prezzi del ${list?.year}?`)) return;
    const { data, error } = await db.from("price_lists").insert({ year, status: "draft", notes: `Copia del ${list?.year}` }).select("id").single();
    if (error) return toast.error(error.message);
    const { data: src } = await db.from("product_prices").select("product_id,market,amount,currency").eq("price_list_id", listId).range(0, 5999);
    if (src?.length) await db.from("product_prices").insert(src.map((x: any) => ({ ...x, price_list_id: data.id })));
    toast.success(`Listino ${year} creato in bozza`);
    await loadLists(); setListId(data.id);
  };

  const activate = async () => {
    if (!confirm(`Attivare il listino ${list?.year}? Il listino attuale verrà archiviato e i nuovi prezzi useranno questo.`)) return;
    const { error } = await db.rpc("activate_price_list", { _id: listId });
    if (error) return toast.error(error.message);
    toast.success(`Listino ${list?.year} attivo`); loadLists();
    setLists((ls) => ls.map((l) => ({ ...l, status: l.id === listId ? "active" : l.status === "active" ? "archived" : l.status })));
  };

  const saveTiers = async () => {
    setSaving(true);
    for (const t of tiers) await db.from("discount_tiers").update({ percentage: t.percentage, label: t.label }).eq("code", t.code);
    setSaving(false); toast.success("Sconti salvati");
  };

  const priceCell = (r: Row, m: Market, onChange: (p: Price) => void) => {
    const p = r.prices[m];
    return (
      <div className="flex items-center gap-1">
        <Input className="h-8 w-24 text-right text-sm" inputMode="decimal" disabled={readOnly} value={p.amount ?? ""} placeholder="—" aria-label={`Prezzo ${MARKET_LABELS[m]}`}
          onChange={(e) => onChange({ ...p, amount: num(e.target.value) })} />
        <CurrencySelect value={p.currency} disabled={readOnly} onChange={(c) => onChange({ ...p, currency: c })} />
      </div>
    );
  };

  const table = (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr><th className="p-2 text-left">Prodotto</th>{MARKETS.map((m) => <th key={m} className="p-2 text-left">Listino {MARKET_LABELS[m]}</th>)}</tr>
        </thead>
        <tbody className="divide-y">
          {visible.map((r) => (
            <tr key={r.product.id} className={dirty.has(r.product.id) ? "bg-accent/30" : ""}>
              <td className="p-2"><div className="flex items-center gap-2">{r.product.image_url && <img src={r.product.image_url} alt="" className="h-9 w-9 shrink-0 rounded object-cover" loading="lazy" />}<span className={r.product.is_active ? "" : "text-muted-foreground"}>{r.product.name}</span></div></td>
              {MARKETS.map((m) => <td key={m} className="p-2">{priceCell(r, m, (p) => update(r.product.id, (x) => ({ ...x, prices: { ...x.prices, [m]: p } })))}</td>)}
            </tr>
          ))}
          {!loading && visible.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Nessun prodotto.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SEOHead title="Prodotti | ERP Vesuviano" description="Catalogo prodotti, listino annuale e sconti" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Prodotti</h1>
          <p className="text-sm text-muted-foreground">Listino annuale per UK, Francia e Germania, sconti per clienti e partner.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={listId} onValueChange={setListId}>
            <SelectTrigger className="w-44" aria-label="Listino"><SelectValue placeholder="Listino" /></SelectTrigger>
            <SelectContent>{lists.map((l) => <SelectItem key={l.id} value={l.id}>Listino {l.year} · {STATUS_LABEL[l.status]}</SelectItem>)}</SelectContent>
          </Select>
          {list && <Badge variant={list.status === "active" ? "default" : "secondary"}>{STATUS_LABEL[list.status]}</Badge>}
          <Button variant="outline" size="sm" onClick={duplicate} disabled={!list}><Copy className="h-4 w-4" />Nuovo listino</Button>
          {list?.status === "draft" && isAdmin && <Button variant="outline" size="sm" onClick={activate}><CheckCircle2 className="h-4 w-4" />Attiva</Button>}
          <Button size="sm" onClick={saveAll} disabled={saving || dirty.size === 0}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Salva{dirty.size ? ` (${dirty.size})` : ""}</Button>
        </div>
      </div>
      {readOnly && <p className="rounded-md border bg-muted/40 p-2 text-sm text-muted-foreground">Listino archiviato: i prezzi sono in sola lettura.</p>}

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="forno">Forni</TabsTrigger>
            <TabsTrigger value="bruciatore">Bruciatori</TabsTrigger>
            <TabsTrigger value="altro">Altri prodotti</TabsTrigger>
            <TabsTrigger value="sconti">Sconti</TabsTrigger>
          </TabsList>
          {tab !== "sconti" && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="h-9 w-56 pl-8" placeholder="Cerca prodotto…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              {tab === "forno" && <Button asChild variant="ghost" size="sm"><Link to="/erp/forni"><Settings2 className="h-4 w-4" />Modelli e schede</Link></Button>}
              {tab === "bruciatore" && <Button asChild variant="ghost" size="sm"><Link to="/erp/bruciatori"><Settings2 className="h-4 w-4" />Schede bruciatori</Link></Button>}
              <Button size="sm" variant="outline" onClick={() => setAdding({ product: { id: "", category: tab as Category, name: "", description: "", image_url: "", cost: null, cost_currency: "EUR", is_active: true, sort_order: 0 }, prices: emptyPrices() })}><Plus className="h-4 w-4" />Aggiungi prodotto</Button>
            </div>
          )}
        </div>
        {["forno", "bruciatore", "altro"].map((c) => <TabsContent key={c} value={c} className="mt-3">{loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : table}</TabsContent>)}
        <TabsContent value="sconti" className="mt-3">
          <div className="max-w-xl space-y-3 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Il prezzo al cliente è il listino del suo paese meno lo sconto del suo tipo. Nella scheda cliente del CRM puoi impostare uno sconto personale che sostituisce questo.</p>
            {tiers.map((t, i) => (
              <div key={t.code} className="flex items-center gap-3">
                <Label className="w-40">{t.label}</Label>
                <Input className="w-24 text-right" inputMode="decimal" value={t.percentage} onChange={(e) => setTiers((ts) => ts.map((x, j) => (j === i ? { ...x, percentage: Number(e.target.value.replace(",", ".")) || 0 } : x)))} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            ))}
            <Button size="sm" onClick={saveTiers} disabled={saving}><Save className="h-4 w-4" />Salva sconti</Button>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!adding} onOpenChange={(o) => !o && setAdding(null)}>
        <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Nuovo prodotto · Listino {list?.year}</DialogTitle></DialogHeader>
          {adding && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1"><Label>Nome</Label><Input value={adding.product.name} onChange={(e) => setAdding({ ...adding, product: { ...adding.product, name: e.target.value } })} /></div>
                <div className="space-y-1"><Label>Categoria</Label>
                  <Select value={adding.product.category} onValueChange={(v) => setAdding({ ...adding, product: { ...adding.product, category: v as Category } })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="forno">Forni</SelectItem><SelectItem value="bruciatore">Bruciatori</SelectItem><SelectItem value="altro">Altri prodotti</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1"><Label>Descrizione</Label><Textarea rows={2} value={adding.product.description || ""} onChange={(e) => setAdding({ ...adding, product: { ...adding.product, description: e.target.value } })} /></div>
              <div className="space-y-1"><Label>Link foto (facoltativo)</Label><Input value={adding.product.image_url || ""} onChange={(e) => setAdding({ ...adding, product: { ...adding.product, image_url: e.target.value } })} /></div>
              <div className="grid gap-3 sm:grid-cols-3">
                {MARKETS.map((m) => <div key={m} className="space-y-1"><Label>Listino {MARKET_LABELS[m]}</Label>{priceCell(adding, m, (p) => setAdding({ ...adding, prices: { ...adding.prices, [m]: p } }))}</div>)}
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setAdding(null)}>Annulla</Button><Button onClick={createProduct} disabled={saving}>Aggiungi</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
