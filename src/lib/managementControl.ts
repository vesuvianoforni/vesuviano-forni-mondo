export interface OrderLike { id: string; total_amount: number | null; created_at: string; status?: string | null }
export interface CostEntry { order_id: string; amount: number }
export interface Expense { expense_date: string; amount: number }

const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const round = (v: number) => Math.round(v * 100) / 100;

/** Costi diretti totali per ordine. */
export function orderCosts(entries: CostEntry[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of entries) out[e.order_id] = round((out[e.order_id] ?? 0) + n(e.amount));
  return out;
}

/** Margine di un ordine: ricavo − costi diretti; percentuale sul ricavo (null se ricavo 0). */
export function orderMargin(revenue: number | null, costs: number) {
  const r = n(revenue);
  const value = round(r - costs);
  return { value, percentage: r > 0 ? Math.round((value / r) * 1000) / 10 : null };
}

/** Conto economico dell'esercizio (anno solare): ricavi ordini − costi diretti − spese di esercizio. */
export function profitAndLoss(year: number, orders: OrderLike[], entries: CostEntry[], expenses: Expense[]) {
  const inYear = orders.filter((o) => new Date(o.created_at).getFullYear() === year && o.status !== "annullato");
  const ids = new Set(inYear.map((o) => o.id));
  const revenue = round(inYear.reduce((s, o) => s + n(o.total_amount), 0));
  const directCosts = round(entries.filter((e) => ids.has(e.order_id)).reduce((s, e) => s + n(e.amount), 0));
  const grossMargin = round(revenue - directCosts);
  const operating = round(expenses.filter((e) => new Date(e.expense_date).getFullYear() === year).reduce((s, e) => s + n(e.amount), 0));
  const result = round(grossMargin - operating);
  return { orders: inYear.length, revenue, directCosts, grossMargin, grossMarginPct: revenue > 0 ? Math.round((grossMargin / revenue) * 1000) / 10 : null, operating, result };
}
