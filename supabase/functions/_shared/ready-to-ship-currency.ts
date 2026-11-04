// Ready-to-ship offers are priced in EUR and converted to the customer's local currency
// (limited to currencies the offer renderer supports) using the daily ECB rate.
export type RtsCurrency = 'EUR' | 'GBP' | 'CHF' | 'USD'

const PREFIXES: [string, RtsCurrency][] = [['44', 'GBP'], ['41', 'CHF'], ['423', 'CHF'], ['1', 'USD']]

export function currencyForPhone(phone: string): RtsCurrency {
  let d = String(phone || '').replace(/[^\d+]/g, '')
  if (d.startsWith('+')) d = d.slice(1)
  else if (d.startsWith('00')) d = d.slice(2)
  else return 'EUR' // no international prefix: assume domestic/eurozone
  const hit = PREFIXES.filter(([p]) => d.startsWith(p)).sort((a, b) => b[0].length - a[0].length)[0]
  return hit ? hit[1] : 'EUR'
}

export function convertEur(amountEur: number, rate: number): number {
  return Math.round(amountEur * rate)
}

export async function ecbRate(currency: RtsCurrency): Promise<{ rate: number; date: string } | null> {
  if (currency === 'EUR') return { rate: 1, date: new Date().toISOString().slice(0, 10) }
  try {
    const r = await fetch(`https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${currency}`, { signal: AbortSignal.timeout(5000) })
    if (!r.ok) return null
    const j = await r.json()
    const rate = Number(j?.rates?.[currency])
    return rate > 0 ? { rate, date: String(j.date) } : null
  } catch { return null }
}
