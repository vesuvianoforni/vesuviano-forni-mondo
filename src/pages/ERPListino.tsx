import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Printer, Search } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { MARKETS, MARKET_LABELS, type Market, customerPrice, effectiveDiscount } from "@/lib/productPricing";

const db = supabase as any;
interface PriceList { id: string; year: number; status: string }
interface Product { id: string; category: string; name: string; description: string | null; is_active: boolean }
interface Tier { code: string; label: string; percentage: number }
const CATEGORY: Record<string, string> = { forno: "Forni", bruciatore: "Bruciatori", altro: "Altri prodotti" };
const STATUS: Record<string, string> = { draft: "Bozza", active: "Attivo", archived: "Archiviato" };

const money = (v: number | null, c: string) => v == null ? "—" : new Intl.NumberFormat("it-IT", { style: "currency", currency: c }).format(v);

export default function ERPListino() {
  const [lists, setLists] = useState<PriceList[]>([]);
  const [listId, setListId] = useState("");
  const [market, setMarket] = useState<Market>("UK");
  const [tier, setTier] = useState("none");
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<Record<string, { amount: number | null; currency: string }>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void (async () => {
      const [l, p, t] = await Promise.all([
        db.from("price_lists").select("id,year,status").order("year", { ascending: false }),
        db.from("products").select("id,category,name,description,is_active").eq("is_active", true).order("sort_order").order("name").range(0, 1999),
        db.from("discount_tiers").select("code,label,percentage").order("sort_order"),
      ]);
      setLists(l.data || []);
      setListId((l.data || []).find((x: PriceList) => x.status === "active")?.id || l.data?.[0]?.id || "");
      setProducts(p.data || []);
      setTiers((t.data || []).map((x: Tier) => ({ ...x, percentage: Number(x.percentage) })));
    })();
  }, []);

  useEffect(() => {
    if (!listId) return;
    setLoading(true);
    void (async () => {
      const { data } = await db.from("product_prices").select("product_id,amount,currency").eq("price_list_id", listId).eq("market", market).range(0, 5999);
      const map: typeof prices = {};
      for (const r of data || []) map[r.product_id] = { amount: r.amount == null ? null : Number(r.amount), currency: r.currency };
      setPrices(map);
      setLoading(false);
    })();
  }, [listId, market]);

  const list = lists.find((l) => l.id === listId);
  const discount = effectiveDiscount(tiers.find((t) => t.code === tier)?.percentage, null);
  const groups = useMemo(() => {
    const q = search.toLowerCase();
    const rows = products.filter((p) => p.name.toLowerCase().includes(q));
    return Object.keys(CATEGORY).map((c) => ({ c, rows: rows.filter((p) => p.category === c) })).filter((g) => g.rows.length);
  }, [products, search]);

  return (
    <div className="erp-dashboard space-y-4 p-4 md:p-6">
      <SEOHead title="Listino | ERP Vesuviano" description="Listino annuale per paese e tipo cliente" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Listino {list?.year ?? ""} {list && <Badge variant={list.status === "active" ? "default" : "outline"} className="ml-2 align-middle">{STATUS[list.status]}</Badge>}</h1>
          <p className="text-sm text-muted-foreground">Prezzi di listino per paese e prezzo netto per tipo cliente. I prezzi si modificano in Prodotti.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden"><Printer className="mr-2 h-4 w-4" />Stampa / PDF</Button>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Select value={listId} onValueChange={setListId}>
          <SelectTrigger className="w-[160px]" aria-label="Anno"><SelectValue placeholder="Anno" /></SelectTrigger>
          <SelectContent>{lists.map((l) => <SelectItem key={l.id} value={l.id}>Listino {l.year} · {STATUS[l.status]}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={market} onValueChange={(v) => setMarket(v as Market)}>
          <SelectTrigger className="w-[150px]" aria-label="Paese"><SelectValue /></SelectTrigger>
          <SelectContent>{MARKETS.map((m) => <SelectItem key={m} value={m}>{MARKET_LABELS[m]}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger className="w-[200px]" aria-label="Tipo cliente"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Solo listino</SelectItem>
            {tiers.map((t) => <SelectItem key={t.code} value={t.code}>{t.label} (−{t.percentage}%)</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca prodotto…" className="pl-9" />
        </div>
      </div>

      {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : groups.map((g) => (
        <section key={g.c} className="overflow-hidden rounded-lg border bg-card">
          <h2 className="border-b bg-muted px-4 py-2 text-sm font-semibold">{CATEGORY[g.c]}</h2>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr><th className="px-4 py-2 text-left font-medium">Prodotto</th><th className="px-4 py-2 text-right font-medium">Listino {MARKET_LABELS[market]}</th>
                {tier !== "none" && <th className="px-4 py-2 text-right font-medium">Netto (−{discount}%)</th>}</tr>
            </thead>
            <tbody>
              {g.rows.map((p) => {
                const pr = prices[p.id];
                return (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{pr ? money(pr.amount, pr.currency) : "—"}</td>
                    {tier !== "none" && <td className="px-4 py-2 text-right font-semibold tabular-nums">{pr ? money(customerPrice(pr.amount, discount), pr.currency) : "—"}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
