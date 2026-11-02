import { SEND_COUNTRIES } from './markets.ts';
export const DAILY_EMAIL_CAP = 200;
export const MIN_INTERVAL_SECONDS = 180;
export const DELIVERY_DAYS = [0, 3, 7];
export function deliveryLimits(daily: number, seconds: number) {
  if (!Number.isInteger(daily) || daily < 1 || daily > DAILY_EMAIL_CAP) throw new Error('Massimo 200 email complessive al giorno.');
  if (!Number.isInteger(seconds) || seconds < MIN_INTERVAL_SECONDS || seconds > 86400) throw new Error('Intervallo minimo di tre minuti.');
  return { daily_limit: daily, min_interval_seconds: seconds };
}
export function deliveryBlock(p: { qualified: boolean; country: string; email: string | null; status: string; replied_at: string | null; recipient_eligibility: string }) {
  if (p.country === 'DE') return 'Germania: contatto manuale, invio bloccato.';
  if (p.country === 'IT' || !SEND_COUNTRIES.includes(p.country as never)) return 'Mercato non abilitato.';
  if (p.replied_at || ['replied', 'unsubscribed', 'bounced', 'manual', 'done', 'suppressed'].includes(p.status)) return 'Contatto fermato: risposta o esclusione registrata.';
  if (!p.qualified || !p.email) return 'Manca la verifica del contatto aziendale.';
  if (p.recipient_eligibility !== 'eligible') return 'Idoneità del destinatario non verificata.';
  return null;
}
export function classifyReply(subject: string, text: string, sender: string) {
  if (/mailer-daemon|postmaster/i.test(sender) || /delivery (?:status|failure)|undeliver|non remis|failure notice/i.test(subject)) return 'bounce';
  if (/^\s*(?:stop|unsubscribe|remove me|désinscri\w*|ne me contactez plus|non contattatemi)\b/im.test(text.slice(0, 1500))) return 'unsubscribe';
  return 'reply';
}