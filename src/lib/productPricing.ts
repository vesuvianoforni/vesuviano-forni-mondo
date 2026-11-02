export const MARKETS = ["UK", "FR", "DE"] as const;
export type Market = (typeof MARKETS)[number];
export const MARKET_LABELS: Record<Market, string> = { UK: "UK", FR: "Francia", DE: "Germania" };
export const CURRENCIES = ["EUR", "GBP", "USD", "CHF"] as const;
export const DEFAULT_MARKET_CURRENCY: Record<Market, string> = { UK: "GBP", FR: "EUR", DE: "EUR" };

/** Sconto applicato al cliente: lo sconto personale, se presente, sostituisce quello del tipo cliente. */
export function effectiveDiscount(tierPercentage: number | null | undefined, override: number | null | undefined): number {
  const value = override ?? tierPercentage ?? 0;
  return Math.min(100, Math.max(0, Number(value) || 0));
}

/** Prezzo cliente = listino − sconto, arrotondato al centesimo. */
export function customerPrice(listPrice: number | null | undefined, discountPercentage: number): number | null {
  if (listPrice == null || !Number.isFinite(listPrice)) return null;
  return Math.round(listPrice * (100 - discountPercentage)) / 100;
}

/** Margine % sul prezzo; calcolato solo se costo e prezzo sono nella stessa valuta. */
export function marginPercentage(cost: number | null | undefined, costCurrency: string, price: number | null | undefined, priceCurrency: string): number | null {
  if (cost == null || price == null || price <= 0 || costCurrency !== priceCurrency) return null;
  return Math.round(((price - cost) / price) * 1000) / 10;
}

/** I vecchi codici A/B/C restano nei record come riferimento al paese: A=UK, B=Francia, C=Germania. */
export const LEGACY_LIST_MARKET: Record<string, Market> = { A: "UK", B: "FR", C: "DE" };
export function priceListLabel(code: string | null | undefined): string {
  if (code === "Reseller") return "Rivenditori";
  const m = code ? LEGACY_LIST_MARKET[code] : undefined;
  return m ? `Listino ${MARKET_LABELS[m]}` : `Listino ${code ?? ""}`;
}
