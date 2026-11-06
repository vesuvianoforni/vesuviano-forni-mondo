import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock, Plus, Save, Search, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { MARKETS, MARKET_LABELS, type Market, marginPercentage } from "@/lib/productPricing";
import { orderCosts, orderMargin, profitAndLoss } from "@/lib/managementControl";

const db = supabase as any;
const eur = (v: number | null | undefined, c = "EUR") => v == null ? "—" : new Intl.NumberFormat("it-IT", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(v);
const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));
const ORDER_COST_CATS = ["produzione", "materiali", "trasporto", "installazione", "provvigioni", "altro"];
const EXPENSE_CATS = ["personale", "affitto", "utenze", "marketing", "consulenze", "trasporti", "altro"];
const CATEGORY: Record<string, string> = { forno: "Forni", bruciatore: "Bruciatori", altro: "Altri" };

interface Product { id: string; category: string; name: string }
interface Order { id: string; order_number: string; customer_name: string | null; company_name: string | null; status: string; total_amount: number; payment_status: string; created_at: string }
interface Entry { id: string; order_id: string; category: string; description: string | null; amount: number }
interface Expense { id: string; expense_date: string; category: string; description: string | null; amount: number }

function MarginBadge({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-muted-foreground">—</span>;
  return <span className={pct < 0 ? "font-semibold text-destructive" : pct < 20 ? "text-muted-foreground" : "font-semibold text-primary"}>{pct}%</span>;
}

export default function ERPControlloGestione() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<Record<string, Partial<Record<Market, { amount: number | null; currency: string }>>>>({});
  const [costs, setCosts] = useState<Record<string, { cost: number | null; currency: string }>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [orders, setOrders] = useState<Order[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ category: "produzione", description: "", amount: "" });
  const [newExp, setNewExp] = useState({ expense_date: new Date().toISOString().slice(0, 10), category: "personale", description: "", amount: "" });

  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data: ok } = u.user ? await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" }) : { data: false };
    setAllowed(!!ok);
    if (!ok) { setLoading(false); return; }
    const { data: list } = await db.from("price_lists").select("id").eq("status", "active").maybeSingle();
    const [p, pr, c, o, e, x] = await Promise.all([
      db.from("products").select("id,category,name").eq("is_active", true).order("name").range(0, 1999),
      list ? db.from("product_prices").select("product_id,market,amount,currency").eq("price_list_id", list.id).range(0, 5999) : { data: [] },
      db.from("product_costs").select("product_id,cost,currency").range(0, 1999),
      db.from("orders").select("id,order_number,customer_name,company_name,status,total_amount,payment_status,created_at").order("created_at", { ascending: false }).range(0, 1999),
      db.from("order_cost_entries").select("id,order_id,category,description,amount").order("created_at").range(0, 9999),
      db.from("operating_expenses").select("id,expense_date,category,description,amount").order("expense_date", { ascending: false }).range(0, 9999),
    ]);
    const pm: typeof prices = {};
    for (const r of pr.data || []) (pm[r.product_id] ||= {})[r.market as Market] = { amount: r.amount == null ? null : Number(r.amount), currency: r.currency };
    const cm: typeof costs = {};
    for (const r of c.data || []) cm[r.product_id] = { cost: r.cost == null ? null : Number(r.cost), currency: r.currency };
    setProducts(p.data || []); setPrices(pm); setCosts(cm); setDirty(new Set());
    setOrders((o.data || []).map((r: Order) => ({ ...r, total_amount: Number(r.total_amount) })));
    setEntries((e.data || []).map((r: Entry) => ({ ...r, amount: Number(r.amount) })));
    setExpenses((x.data || []).map((r: Expense) => ({ ...r, amount: Number(r.amount) })));
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const perOrder = useMemo(() => orderCosts(entries), [entries]);
  const pl = useMemo(() => profitAndLoss(year, orders, entries, expenses), [year, orders, entries, expenses]);
  const years = useMemo(() => Array.from(new Set([new Date().getFullYear(), ...orders.map((o) => new Date(o.created_at).getFullYear()), ...expenses.map((e) => new Date(e.expense_date).getFullYear())])).sort((a, b) => b - a), [orders, expenses]);
  const yearOrders = orders.filter((o) => new Date(o.created_at).getFullYear() === year);
  const yearExpenses = expenses.filter((e) => new Date(e.expense_date).getFullYear() === year);
  const visibleProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const withCost = products.filter((p) => costs[p.id]?.cost != null).length;

  const saveCosts = async () => {
    const rows = [...dirty].map((id) => ({ product_id: id, cost: costs[id]?.cost ?? null, currency: costs[id]?.currency || "EUR" }));
    const { error } = await db.from("product_costs").upsert(rows, { onConflict: "product_id" });
    if (error) return toast.error(error.message);
    toast.success("Costi salvati"); setDirty(new Set());
   return undefined; };
  const addEntry = async (orderId: string) => {
    const amount = num(newEntry.amount);
    if (amount == null) return toast.error("Inserisci un importo");
    const { error } = await db.from("order_cost_entries").insert({ order_id: orderId, category: newEntry.category, description: newEntry.description || null, amount });
    if (error) return toast.error(error.message);
    setNewEntry({ category: "produzione", description: "", amount: "" }); void load();
   return undefined; };
  const delEntry = async (id: string) => { const { error } = await db.from("order_cost_entries").delete().eq("id", id); if (error) toast.error(error.message); else void load(); };
  const addExpense = async () => {
    const amount = num(newExp.amount);
    if (amount == null) return toast.error("Inserisci un importo");
    const { error } = await db.from("operating_expenses").insert({ ...newExp, description: newExp.description || null, amount });
    if (error) return toast.error(error.message);
    setNewExp({ ...newExp, description: "", amount: "" }); void load();
   return undefined; };
  const delExpense = async (id: string) => { const { error } = await db.from("operating_expenses").delete().eq("id", id); if (error) toast.error(error.message); else void load(); };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!allowed) return (
    <div className="erp-dashboard flex h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <Lock className="h-6 w-6 text-muted-foreground" /><p className="font-medium">Sezione riservata all'amministratore</p>
    </div>
  );

  const kpi = (label: string, value: number | null, tone?: "pos" | "neg", sub?: string) => (
    <Card><CardHeader className="pb-1"><CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent><p className={`text-2xl font-bold tabular-nums ${tone === "neg" ? "text-destructive" : tone === "pos" ? "text-primary" : ""}`}>{eur(value)}</p>{sub && <p className="text-xs text-muted-foreground">{sub}</p>}</CardContent></Card>
  );

  return (
    <div className="erp-dashboard space-y-4 p-4 md:p-6">
      <SEOHead title="Controllo di gestione | ERP Vesuviano" description="Costi, marginalità e risultato d'esercizio" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Controllo di gestione</h1>
          <p className="text-sm text-muted-foreground">Costi prodotti, marginalità sul listino, costi per ordine e risultato d'esercizio. Visibile solo all'amministratore.</p>
        </div>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-[140px]" aria-label="Esercizio"><SelectValue /></SelectTrigger>
          <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>Esercizio {y}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="riepilogo">
        <TabsList className="flex-wrap">
          <TabsTrigger value="riepilogo">Conto economico</TabsTrigger>
          <TabsTrigger value="costi">Costi e marginalità</TabsTrigger>
          <TabsTrigger value="ordini">Ordini</TabsTrigger>
          <TabsTrigger value="spese">Spese di esercizio</TabsTrigger>
        </TabsList>

        <TabsContent value="riepilogo" className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {kpi("Ricavi ordini", pl.revenue, undefined, `${pl.orders} ordini`)}
            {kpi("Costi diretti", pl.directCosts)}
            {kpi("Margine lordo", pl.grossMargin, pl.grossMargin < 0 ? "neg" : "pos", pl.grossMarginPct != null ? `${pl.grossMarginPct}% sui ricavi` : undefined)}
            {kpi("Spese di esercizio", pl.operating)}
            {kpi(pl.result >= 0 ? "Utile d'esercizio" : "Perdita d'esercizio", pl.result, pl.result < 0 ? "neg" : "pos")}
          </div>
          <Card><CardContent className="pt-6">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                <tr><td className="py-2">Ricavi da ordini</td><td className="py-2 text-right tabular-nums">{eur(pl.revenue)}</td></tr>
                <tr><td className="py-2">− Costi diretti degli ordini</td><td className="py-2 text-right tabular-nums">{eur(-pl.directCosts)}</td></tr>
                <tr className="font-semibold"><td className="py-2">= Margine lordo</td><td className="py-2 text-right tabular-nums">{eur(pl.grossMargin)}</td></tr>
                <tr><td className="py-2">− Spese di esercizio</td><td className="py-2 text-right tabular-nums">{eur(-pl.operating)}</td></tr>
                <tr className="text-base font-bold"><td className="py-2">= {pl.result >= 0 ? "Utile" : "Perdita"} d'esercizio {year}</td><td className={`py-2 text-right tabular-nums ${pl.result < 0 ? "text-destructive" : "text-primary"}`}>{eur(pl.result)}</td></tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted-foreground">Ricavi per data ordine, al netto degli ordini annullati. Importi gestionali, non sostituiscono il bilancio civilistico. {yearOrders.filter((o) => !perOrder[o.id]).length} ordini dell'esercizio non hanno ancora costi registrati.</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="costi" className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca prodotto…" className="pl-9" /></div>
            <Badge variant="secondary">{withCost}/{products.length} con costo</Badge>
            <Button size="sm" onClick={saveCosts} disabled={!dirty.size}><Save className="mr-2 h-4 w-4" />Salva costi{dirty.size ? ` (${dirty.size})` : ""}</Button>
          </div>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted text-xs text-muted-foreground"><tr>
                <th className="p-2 text-left">Prodotto</th><th className="p-2 text-left">Costo</th>
                {MARKETS.map((m) => <th key={m} className="p-2 text-right">Listino {MARKET_LABELS[m]} · margine</th>)}
              </tr></thead>
              <tbody className="divide-y">
                {visibleProducts.map((p) => {
                  const c = costs[p.id] || { cost: null, currency: "EUR" };
                  return (
                    <tr key={p.id} className={dirty.has(p.id) ? "bg-accent/30" : ""}>
                      <td className="p-2"><span className="mr-2 text-[10px] uppercase text-muted-foreground">{CATEGORY[p.category]}</span>{p.name}</td>
                      <td className="p-2"><div className="flex items-center gap-1">
                        <Input className="h-8 w-24 text-right" inputMode="decimal" value={c.cost ?? ""} placeholder="—" aria-label={`Costo ${p.name}`}
                          onChange={(e) => { setCosts({ ...costs, [p.id]: { ...c, cost: num(e.target.value) } }); setDirty(new Set(dirty).add(p.id)); }} />
                        <Select value={c.currency} onValueChange={(v) => { setCosts({ ...costs, [p.id]: { ...c, currency: v } }); setDirty(new Set(dirty).add(p.id)); }}>
                          <SelectTrigger className="h-8 w-[72px] px-2 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{["EUR", "GBP", "USD", "CHF"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                        </Select>
                      </div></td>
                      {MARKETS.map((m) => {
                        const pr = prices[p.id]?.[m];
                        return <td key={m} className="p-2 text-right tabular-nums">{pr?.amount != null ? eur(pr.amount, pr.currency) : "—"} · <MarginBadge pct={marginPercentage(c.cost, c.currency, pr?.amount, pr?.currency || "EUR")} /></td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Margine = (prezzo di listino − costo) / prezzo, calcolato solo quando costo e prezzo sono nella stessa valuta. Lo sconto cliente riduce ulteriormente il margine.</p>
        </TabsContent>

        <TabsContent value="ordini" className="mt-4">
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-muted text-xs text-muted-foreground"><tr>
                <th className="w-8 p-2" /><th className="p-2 text-left">Ordine</th><th className="p-2 text-left">Cliente</th><th className="p-2 text-left">Stato</th>
                <th className="p-2 text-right">Ricavo</th><th className="p-2 text-right">Costi</th><th className="p-2 text-right">Margine</th>
              </tr></thead>
              <tbody className="divide-y">
                {yearOrders.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nessun ordine nell'esercizio {year}.</td></tr>}
                {yearOrders.map((o) => {
                  const cost = perOrder[o.id] ?? 0; const m = orderMargin(o.total_amount, cost); const isOpen = open === o.id;
                  return [
                    <tr key={o.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setOpen(isOpen ? null : o.id)}>
                      <td className="p-2">{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</td>
                      <td className="p-2 font-medium">{o.order_number}<span className="block text-[11px] text-muted-foreground">{new Date(o.created_at).toLocaleDateString("it-IT")}</span></td>
                      <td className="p-2">{o.company_name || o.customer_name || "—"}</td>
                      <td className="p-2"><Badge variant="outline" className="text-[11px]">{o.status.replace(/_/g, " ")}</Badge></td>
                      <td className="p-2 text-right tabular-nums">{eur(o.total_amount)}</td>
                      <td className="p-2 text-right tabular-nums">{perOrder[o.id] != null ? eur(cost) : <span className="text-xs text-muted-foreground">da inserire</span>}</td>
                      <td className="p-2 text-right tabular-nums">{perOrder[o.id] != null ? <>{eur(m.value)} · <MarginBadge pct={m.percentage} /></> : "—"}</td>
                    </tr>,
                    isOpen && (
                      <tr key={`${o.id}-d`} className="bg-muted/30"><td colSpan={7} className="p-3">
                        <div className="space-y-2">
                          {entries.filter((e) => e.order_id === o.id).map((e) => (
                            <div key={e.id} className="flex items-center gap-3 text-sm">
                              <Badge variant="secondary" className="capitalize">{e.category}</Badge><span className="flex-1">{e.description}</span>
                              <span className="tabular-nums">{eur(e.amount)}</span>
                              <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Elimina costo" onClick={() => delEntry(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          ))}
                          <div className="flex flex-wrap items-center gap-2">
                            <Select value={newEntry.category} onValueChange={(v) => setNewEntry({ ...newEntry, category: v })}>
                              <SelectTrigger className="h-8 w-[140px] capitalize"><SelectValue /></SelectTrigger>
                              <SelectContent>{ORDER_COST_CATS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                            </Select>
                            <Input className="h-8 min-w-[180px] flex-1" placeholder="Descrizione" value={newEntry.description} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} />
                            <Input className="h-8 w-28 text-right" inputMode="decimal" placeholder="€" value={newEntry.amount} onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })} />
                            <Button size="sm" onClick={() => addEntry(o.id)}><Plus className="mr-1 h-4 w-4" />Aggiungi costo</Button>
                          </div>
                        </div>
                      </td></tr>
                    ),
                  ];
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="spese" className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
            <Input type="date" className="h-9 w-[150px]" value={newExp.expense_date} onChange={(e) => setNewExp({ ...newExp, expense_date: e.target.value })} />
            <Select value={newExp.category} onValueChange={(v) => setNewExp({ ...newExp, category: v })}>
              <SelectTrigger className="h-9 w-[150px] capitalize"><SelectValue /></SelectTrigger>
              <SelectContent>{EXPENSE_CATS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input className="h-9 min-w-[200px] flex-1" placeholder="Descrizione" value={newExp.description} onChange={(e) => setNewExp({ ...newExp, description: e.target.value })} />
            <Input className="h-9 w-28 text-right" inputMode="decimal" placeholder="€" value={newExp.amount} onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })} />
            <Button onClick={addExpense}><Plus className="mr-1 h-4 w-4" />Aggiungi spesa</Button>
          </div>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs text-muted-foreground"><tr><th className="p-2 text-left">Data</th><th className="p-2 text-left">Categoria</th><th className="p-2 text-left">Descrizione</th><th className="p-2 text-right">Importo</th><th className="w-10" /></tr></thead>
              <tbody className="divide-y">
                {yearExpenses.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nessuna spesa registrata nel {year}.</td></tr>}
                {yearExpenses.map((e) => (
                  <tr key={e.id}><td className="p-2">{new Date(e.expense_date).toLocaleDateString("it-IT")}</td><td className="p-2 capitalize">{e.category}</td><td className="p-2">{e.description}</td>
                    <td className="p-2 text-right tabular-nums">{eur(e.amount)}</td>
                    <td className="p-2"><Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Elimina spesa" onClick={() => delExpense(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
